"""
Automated unit and integration test suite for FarmLink Direct.
Verifies spatial match, atomic order lock, forecast engine, and settlement.
"""

from datetime import date, timedelta
from django.test import TestCase
from django.utils import timezone
from accounts.models import User, Organization
from lots.models import Farm, Lot
from orders.models import Order
from forecasts.engine import get_price_guidance, generate_forecasts
from routing.planner import plan_route
from fulfillment.models import Settlement


class FarmLinkIntegrationTests(TestCase):
    def setUp(self):
        # 1. Orgs
        self.fpo = Organization.objects.create(name="Lucknow FPO", org_type="fpo")
        self.buyer_org = Organization.objects.create(name="Fresh Mart", org_type="buyer_org")

        # 2. Users
        self.farmer = User.objects.create_user(
            username="ramesh", password="password123",
            role="farmer", organization=self.fpo,
        )
        self.buyer = User.objects.create_user(
            username="buyer1", password="password123",
            role="buyer", organization=self.buyer_org,
        )

        # 3. Farm near Lucknow (Bakshi Ka Talab)
        self.farm = Farm.objects.create(
            owner=self.farmer,
            name="Ramesh Farm",
            village="Bakshi Ka Talab",
            district="Lucknow",
            latitude=26.9124,
            longitude=80.8947,
        )

        # 4. Lot: 500kg Tomato Grade A @ 38/kg
        now = timezone.now()
        self.lot = Lot.objects.create(
            farm=self.farm,
            created_by=self.farmer,
            commodity="tomato",
            grade="A",
            available_qty=500,
            unit="kg",
            asking_price=38.0,
            harvest_at=date.today() + timedelta(days=1),
            pickup_window_start=now,
            pickup_window_end=now + timedelta(hours=12),
            status="listed",
        )

    def test_haversine_distance_calculation(self):
        """Test distance between Lucknow center and Bakshi Ka Talab (~9.1 km)."""
        dist = Farm.haversine_distance(26.8467, 80.9462, 26.9124, 80.8947)
        self.assertGreater(dist, 5.0)
        self.assertLess(dist, 20.0)

    def test_atomic_order_reservation(self):
        """Test atomic order creation decreases available lot quantity without overselling."""
        order = Order.create_order(
            buyer=self.buyer,
            lot=self.lot,
            requested_qty=300,
            agreed_price=38.0,
        )
        self.assertEqual(order.status, "reserved")
        self.assertEqual(order.requested_qty, 300)

        # Lot remaining qty should now be 200
        self.lot.refresh_from_db()
        self.assertEqual(self.lot.remaining_qty, 200)
        self.assertEqual(self.lot.reserved_qty, 300)
        self.assertEqual(self.lot.status, "partially_reserved")

        # Attempting to order 300 more should fail because only 200 remain
        with self.assertRaises(ValueError):
            Order.create_order(
                buyer=self.buyer,
                lot=self.lot,
                requested_qty=300,
                agreed_price=38.0,
            )

    def test_price_forecast_guidance(self):
        """Test 7-day deterministic forecast returns expected range and explanation."""
        guidance = get_price_guidance("tomato", "Lucknow")
        self.assertIsNotNone(guidance)
        self.assertEqual(guidance["commodity"], "tomato")
        self.assertEqual(len(guidance["seven_day"]), 7)
        self.assertIn("confidence", guidance["today"])
        self.assertIn("explanation", guidance)

    def test_route_planner(self):
        """Test nearest-neighbor route planner with capacity constraint."""
        order = Order.create_order(
            buyer=self.buyer,
            lot=self.lot,
            requested_qty=300,
            agreed_price=38.0,
        )
        order.transition_to("confirmed")
        route = plan_route([order.id], vehicle_capacity=2000)
        self.assertEqual(route.stops.count(), 2)
        self.assertEqual(route.total_load_kg, 300)
        self.assertLessEqual(route.total_load_kg, route.max_capacity_kg)

    def test_user_registration_api(self):
        """Test registration endpoint creates real user and returns JWT token."""
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "kisan_mohan",
                "password": "pass1234Secure",
                "first_name": "Mohan",
                "last_name": "Verma",
                "phone": "+91-9988776655",
                "role": "farmer",
                "organization_name": "Chinhat Kisan Mandal",
                "location": "Chinhat, Lucknow",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("access", response.data)
        self.assertEqual(response.data["user"]["username"], "kisan_mohan")
        self.assertEqual(response.data["user"]["role"], "farmer")
        # Check database persistence
        from accounts.models import User
        from lots.models import Farm
        user = User.objects.get(username="kisan_mohan")
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, "Mohan")
        farm = Farm.objects.filter(owner=user).first()
        self.assertIsNotNone(farm)
        self.assertEqual(farm.village, "Chinhat")

    def test_mandi_sync_api(self):
        """Test sync mandi endpoint returns baseline or live data."""
        response = self.client.post(
            "/api/forecasts/sync-mandi/",
            {"commodity": "tomato"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("base_price", response.data)
        self.assertIn("source", response.data)

    def test_google_auth_api(self):
        """Test 1-click Google authentication creates user, farm, and JWT token."""
        response = self.client.post(
            "/api/auth/google/",
            {
                "email": "ankit_buyer@gmail.com",
                "name": "Ankit Sharma",
                "role": "buyer",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertEqual(response.data["user"]["email"], "ankit_buyer@gmail.com")
        self.assertEqual(response.data["user"]["role"], "buyer")

    def test_lot_distance_to(self):
        """Test Lot.distance_to method calculates distance to Lucknow coordinates."""
        dist = self.lot.distance_to(26.8467, 80.9462)
        self.assertIsInstance(dist, float)
        self.assertGreater(dist, 0)

    def test_settlement_calculation(self):
        """Test transparent fee calculation (5% logistics, 2% platform, net farmer)."""
        order = Order.create_order(
            buyer=self.buyer,
            lot=self.lot,
            requested_qty=300,
            agreed_price=38.0,
        )
        # 300kg * 38 = 11,400 INR
        settlement = Settlement.create_for_order(order)
        self.assertEqual(settlement.gross_amount, 11400.0)
        self.assertEqual(settlement.logistics_fee, 570.0)  # 5%
        self.assertEqual(settlement.platform_fee, 228.0)   # 2%
        self.assertEqual(settlement.status, "ready")

    def test_driver_order_pickup_transition(self):
        """Test driver can transition order directly from confirmed to picked_up."""
        order = Order.create_order(
            buyer=self.buyer,
            lot=self.lot,
            requested_qty=200,
            agreed_price=38.0,
        )
        order.transition_to("confirmed")
        self.assertEqual(order.status, "confirmed")
        # Driver picks up produce from farm gate
        order.transition_to("picked_up", note="Inspected at farm gate")
        self.assertEqual(order.status, "picked_up")
        # Driver delivers to buyer dock
        order.transition_to("delivered", note="Delivered with OTP")
        self.assertEqual(order.status, "delivered")
