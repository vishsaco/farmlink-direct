import json
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from accounts.farmer_verification import (
    verify_farmer_with_government_database,
    validate_government_id_format,
)


class GovernmentFarmerVerificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_id_format_validation(self):
        # Valid UP format
        ok, res = validate_government_id_format("UP20248849201")
        self.assertTrue(ok)
        self.assertEqual(res, "UP20248849201")

        # Invalid state code
        ok, err = validate_government_id_format("XX12345678")
        self.assertFalse(ok)
        self.assertIn("Invalid State code", err)

        # Invalid short string
        ok, err = validate_government_id_format("123")
        self.assertFalse(ok)

    def test_government_database_verification_real(self):
        # Known registered UP AgriStack record
        res = verify_farmer_with_government_database(
            farmer_id="UP20248849201",
            khasra_number="142/2A",
            district="Lucknow"
        )
        self.assertTrue(res["verified"])
        self.assertEqual(res["beneficiary_name"], "Vikas Yadav")
        self.assertEqual(res["tehsil"], "Bakshi Ka Talab")
        self.assertEqual(res["khasra_number"], "142/2A")
        self.assertEqual(res["land_size_acres"], 2.5)
        self.assertTrue(res["aadhaar_verified"])
        self.assertIn("telemetry", res)

    def test_government_database_rejection_fake_id(self):
        # Fake / unregistered ID
        res = verify_farmer_with_government_database(
            farmer_id="UP9999999999",
            khasra_number="999/99",
            district="Lucknow"
        )
        self.assertFalse(res["verified"])
        self.assertIn("could not be located", res["error"])
        self.assertEqual(res["error_code"], "NOT_FOUND_IN_GOVT_REGISTRY")

    def test_verify_farmer_id_api_endpoint(self):
        # Real government ID check
        res = self.client.post(
            "/api/auth/verify-farmer-id/",
            {"farmer_id": "UP109823412", "khasra_number": "258/1"},
            format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["success"])
        self.assertEqual(res.data["data"]["beneficiary_name"], "Ramesh Chandra Verma")

        # Fake ID check -> 400 Bad Request with clear government rejection
        res_fake = self.client.post(
            "/api/auth/verify-farmer-id/",
            {"farmer_id": "UP000000000", "khasra_number": "00/00"},
            format="json"
        )
        self.assertEqual(res_fake.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(res_fake.data["success"])
        self.assertIn("could not be located", res_fake.data["error"])

    def test_farmer_registration_with_government_verification(self):
        # 1. Registration with fake ID should fail
        payload_fake = {
            "username": "fake_farmer_test",
            "password": "Password123!",
            "first_name": "Fake",
            "last_name": "Farmer",
            "phone": "+91-9876543210",
            "role": "farmer",
            "pm_kisan_id": "UP000000000",
            "khasra_number": "999",
        }
        res_fail = self.client.post("/api/auth/register/", payload_fake, format="json")
        self.assertEqual(res_fail.status_code, status.HTTP_400_BAD_REQUEST)

        # 2. Registration with real government ID should succeed and verify
        payload_real = {
            "username": "real_vikas_kisan",
            "password": "Password123!",
            "first_name": "Vikas",
            "last_name": "Yadav",
            "phone": "+91-9876543210",
            "role": "farmer",
            "pm_kisan_id": "UP20248849201",
            "khasra_number": "142/2A",
        }
        res_ok = self.client.post("/api/auth/register/", payload_real, format="json")
        self.assertEqual(res_ok.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res_ok.data["user"]["is_verified"])
        self.assertEqual(res_ok.data["user"]["kisan_verification_status"], "verified")
        self.assertEqual(res_ok.data["user"]["pm_kisan_id"], "UP20248849201")
        self.assertEqual(res_ok.data["user"]["land_size_acres"], 2.5)
