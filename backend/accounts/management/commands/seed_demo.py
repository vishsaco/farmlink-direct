"""
Management command to seed demo data for FarmLink Direct.
Creates users, farms, lots, and forecasts around Lucknow.
"""

from datetime import date, timedelta, datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User, Organization
from lots.models import Farm, Lot
from forecasts.engine import generate_forecasts


class Command(BaseCommand):
    help = "Seed demo data for FarmLink Direct (Lucknow cluster)"

    def handle(self, *args, **options):
        self.stdout.write("--- Seeding FarmLink Direct demo data ---\n")

        # Clear existing data
        User.objects.filter(is_superuser=False).delete()
        Organization.objects.all().delete()
        Farm.objects.all().delete()
        Lot.objects.all().delete()

        # ─── Organizations ───
        fpo_org = Organization.objects.create(
            name="Lucknow Kisan FPO",
            org_type="fpo",
            location="Bakshi Ka Talab, Lucknow",
            phone="+91-9876543210",
        )
        buyer_org = Organization.objects.create(
            name="Fresh Mart Retailers",
            org_type="buyer_org",
            location="Hazratganj, Lucknow",
            phone="+91-9876543220",
        )
        buyer_org_2 = Organization.objects.create(
            name="City Kitchen Supplies",
            org_type="buyer_org",
            location="Gomti Nagar, Lucknow",
            phone="+91-9876543230",
        )
        logistics_org = Organization.objects.create(
            name="FarmLink Logistics",
            org_type="logistics",
            location="Amausi, Lucknow",
        )

        self.stdout.write(f"  [OK] Created {Organization.objects.count()} organizations")

        # ─── Users ───
        password = "farm1234"

        # Farmers
        farmer1 = User.objects.create_user(
            username="ramesh", password=password,
            first_name="Ramesh", last_name="Kumar",
            role="farmer", phone="+91-9001001001",
            language="hi", is_verified=True,
            organization=fpo_org,
        )
        farmer2 = User.objects.create_user(
            username="sunita", password=password,
            first_name="Sunita", last_name="Devi",
            role="farmer", phone="+91-9001001002",
            language="hi", is_verified=True,
            organization=fpo_org,
        )
        farmer3 = User.objects.create_user(
            username="arvind", password=password,
            first_name="Arvind", last_name="Singh",
            role="farmer", phone="+91-9001001003",
            language="en", is_verified=True,
        )
        farmer4 = User.objects.create_user(
            username="priya", password=password,
            first_name="Priya", last_name="Patel",
            role="farmer", phone="+91-9001001004",
            language="hi", is_verified=True,
            organization=fpo_org,
        )
        farmer5 = User.objects.create_user(
            username="vikram", password=password,
            first_name="Vikram", last_name="Yadav",
            role="farmer", phone="+91-9001001005",
            language="en", is_verified=True,
        )

        # FPO operator
        fpo_user = User.objects.create_user(
            username="fpo_admin", password=password,
            first_name="Rajesh", last_name="Tiwari",
            role="fpo", phone="+91-9002002001",
            language="en", is_verified=True,
            organization=fpo_org,
        )

        # Buyers
        buyer1 = User.objects.create_user(
            username="buyer1", password=password,
            first_name="Ankit", last_name="Sharma",
            role="buyer", phone="+91-9003003001",
            language="en", is_verified=True,
            organization=buyer_org,
        )
        buyer2 = User.objects.create_user(
            username="buyer2", password=password,
            first_name="Meera", last_name="Gupta",
            role="buyer", phone="+91-9003003002",
            language="en", is_verified=True,
            organization=buyer_org_2,
        )

        # Ops
        ops_user = User.objects.create_user(
            username="ops", password=password,
            first_name="Deepak", last_name="Verma",
            role="ops", phone="+91-9004004001",
            language="en", is_verified=True,
            organization=logistics_org,
        )

        # Driver
        driver_user = User.objects.create_user(
            username="driver1", password=password,
            first_name="Suresh", last_name="Chauhan",
            role="driver", phone="+91-9005005001",
            language="hi", is_verified=True,
            organization=logistics_org,
        )

        self.stdout.write(f"  [OK] Created {User.objects.filter(is_superuser=False).count()} users (password: {password})")

        # ─── Farms around Lucknow ───
        farms_data = [
            {"owner": farmer1, "name": "Ramesh Farm", "village": "Bakshi Ka Talab", "lat": 26.9124, "lng": 80.8947},
            {"owner": farmer2, "name": "Sunita Farm", "village": "Malihabad", "lat": 26.9275, "lng": 80.7225},
            {"owner": farmer3, "name": "Arvind Farm", "village": "Mohanlalganj", "lat": 26.7494, "lng": 80.9832},
            {"owner": farmer4, "name": "Priya Farm", "village": "Kakori", "lat": 26.8721, "lng": 80.7867},
            {"owner": farmer5, "name": "Vikram Farm", "village": "Chinhat", "lat": 26.8920, "lng": 81.0351},
        ]
        farms = []
        for fd in farms_data:
            farm = Farm.objects.create(
                owner=fd["owner"],
                name=fd["name"],
                village=fd["village"],
                district="Lucknow",
                state="Uttar Pradesh",
                latitude=fd["lat"],
                longitude=fd["lng"],
            )
            farms.append(farm)

        self.stdout.write(f"  [OK] Created {len(farms)} farms around Lucknow")

        # ─── Lots ───
        today = date.today()
        tomorrow = today + timedelta(days=1)
        now = timezone.now()

        lots_data = [
            # Tomatoes
            {"farm": farms[0], "creator": farmer1, "commodity": "tomato", "grade": "A",
             "qty": 500, "price": 38, "harvest": today},
            {"farm": farms[1], "creator": farmer2, "commodity": "tomato", "grade": "B",
             "qty": 300, "price": 32, "harvest": today},
            {"farm": farms[3], "creator": farmer4, "commodity": "tomato", "grade": "A",
             "qty": 400, "price": 36, "harvest": tomorrow},
            # Onions
            {"farm": farms[2], "creator": farmer3, "commodity": "onion", "grade": "A",
             "qty": 800, "price": 30, "harvest": today},
            {"farm": farms[0], "creator": farmer1, "commodity": "onion", "grade": "B",
             "qty": 600, "price": 25, "harvest": today},
            {"farm": farms[4], "creator": farmer5, "commodity": "onion", "grade": "A",
             "qty": 450, "price": 28, "harvest": tomorrow},
            # Potatoes
            {"farm": farms[2], "creator": farmer3, "commodity": "potato", "grade": "A",
             "qty": 1000, "price": 24, "harvest": today},
            {"farm": farms[4], "creator": farmer5, "commodity": "potato", "grade": "B",
             "qty": 700, "price": 20, "harvest": today},
            {"farm": farms[1], "creator": farmer2, "commodity": "potato", "grade": "A",
             "qty": 500, "price": 22, "harvest": tomorrow},
            {"farm": farms[3], "creator": farmer4, "commodity": "potato", "grade": "C",
             "qty": 350, "price": 18, "harvest": today},
        ]

        for ld in lots_data:
            Lot.objects.create(
                farm=ld["farm"],
                created_by=ld["creator"],
                commodity=ld["commodity"],
                grade=ld["grade"],
                available_qty=ld["qty"],
                unit="kg",
                asking_price=ld["price"],
                harvest_at=ld["harvest"],
                pickup_window_start=now + timedelta(hours=6),
                pickup_window_end=now + timedelta(hours=18),
                quality_notes=f"Fresh {ld['commodity']}, Grade {ld['grade']}, hand-picked",
                status="listed",
            )

        self.stdout.write(f"  [OK] Created {Lot.objects.count()} produce lots")

        # --- Forecasts ---
        for commodity in ("tomato", "onion", "potato"):
            generate_forecasts(commodity, "Lucknow")

        self.stdout.write(f"  [OK] Generated 7-day forecasts for 3 commodities")

        # --- Summary ---
        self.stdout.write(self.style.SUCCESS("\n[SUCCESS] Demo data seeded successfully!"))
        self.stdout.write(f"\nLogin credentials (all passwords: {password}):")
        self.stdout.write(f"   Farmers:  ramesh, sunita, arvind, priya, vikram")
        self.stdout.write(f"   FPO:      fpo_admin")
        self.stdout.write(f"   Buyers:   buyer1, buyer2")
        self.stdout.write(f"   Ops:      ops")
        self.stdout.write(f"   Driver:   driver1")
        self.stdout.write(f"\nMap: Lucknow cluster: ~26.85°N, ~80.95°E")
        self.stdout.write(f"   Farms in: Bakshi Ka Talab, Malihabad, Mohanlalganj, Kakori, Chinhat")
