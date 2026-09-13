"""Serializers for authentication and user management."""

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Organization
from lots.models import Farm


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "org_type", "location", "phone"]


class UserSerializer(serializers.ModelSerializer):
    organization_detail = OrganizationSerializer(
        source="organization", read_only=True
    )
    is_verified_farmer = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "first_name", "last_name", "email",
            "role", "phone", "organization", "organization_detail",
            "language", "is_verified", "avatar_url",
            # Pillar 1: Government AgriStack & Land Records Fields
            "pm_kisan_id", "khasra_number", "land_size_acres",
            "tehsil", "village_lgd_code", "kisan_verification_status",
            "kisan_verified_at", "kisan_verified_by", "is_verified_farmer",
        ]
        read_only_fields = [
            "id", "is_verified", "kisan_verification_status",
            "kisan_verified_at", "kisan_verified_by", "is_verified_farmer",
        ]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            username=data["username"],
            password=data["password"],
        )
        if not user:
            raise serializers.ValidationError("Invalid username or password.")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")
        data["user"] = user
        return data


from django.utils import timezone
from .farmer_verification import verify_farmer_with_government_database


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=4)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    phone = serializers.CharField(max_length=20)
    role = serializers.ChoiceField(choices=["farmer", "fpo", "buyer", "driver", "ops"])
    language = serializers.ChoiceField(choices=["en", "hi"], default="en")
    organization_name = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    location = serializers.CharField(max_length=255, required=False, allow_blank=True, default="Bakshi Ka Talab, Lucknow")

    # Pillar 1: Government AgriStack & Land Records Fields
    pm_kisan_id = serializers.CharField(max_length=50, required=False, allow_blank=True, default="")
    khasra_number = serializers.CharField(max_length=50, required=False, allow_blank=True, default="")
    land_size_acres = serializers.FloatField(required=False, default=0.0)
    tehsil = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")

    def validate_username(self, value):
        cleaned_val = value.strip()
        if not cleaned_val:
            raise serializers.ValidationError("Username cannot be blank.")
        if User.objects.filter(username__iexact=cleaned_val).exists():
            raise serializers.ValidationError(f"Username '{cleaned_val}' is already registered. Please choose another username or sign in.")
        return cleaned_val

    def validate(self, data):
        role = data.get("role")
        if role == "farmer":
            pm_kisan_id = data.get("pm_kisan_id", "").strip()
            khasra_number = data.get("khasra_number", "").strip()
            
            gov_res = verify_farmer_with_government_database(
                farmer_id=pm_kisan_id,
                khasra_number=khasra_number,
                district="Lucknow",
            )
            if not gov_res.get("verified"):
                raise serializers.ValidationError({
                    "pm_kisan_id": gov_res.get("error", "Government AgriStack / UP Bhulekh verification failed.")
                })
            data["gov_verification"] = gov_res
        return data

    def create(self, validated_data):
        gov_verification = validated_data.pop("gov_verification", None)
        pm_kisan_id = validated_data.pop("pm_kisan_id", "").strip()
        khasra_number = validated_data.pop("khasra_number", "").strip()
        land_size_acres = validated_data.pop("land_size_acres", 0.0)
        tehsil = validated_data.pop("tehsil", "").strip()

        org_name = validated_data.pop("organization_name", "").strip()
        location = validated_data.pop("location", "Bakshi Ka Talab, Lucknow").strip()
        password = validated_data.pop("password")
        role = validated_data.get("role")

        is_verified = False
        kisan_verification_status = "unverified"
        kisan_verified_at = None
        kisan_verified_by = ""
        village_name = ""

        if role == "farmer":
            if gov_verification and gov_verification.get("verified"):
                is_verified = True
                kisan_verification_status = "verified"
                kisan_verified_at = timezone.now()
                kisan_verified_by = gov_verification.get("verified_by", "UP Bhulekh & PM-KISAN Central Registry")
                pm_kisan_id = gov_verification.get("pm_kisan_id", pm_kisan_id)
                khasra_number = gov_verification.get("khasra_number", khasra_number)
                land_size_acres = gov_verification.get("land_size_acres", land_size_acres)
                tehsil = gov_verification.get("tehsil", tehsil)
                village_name = gov_verification.get("village", "")
                if village_name:
                    location = f"{village_name}, {tehsil}, Lucknow"
        else:
            is_verified = True

        organization = None
        if org_name:
            org_type = "fpo" if role in ("farmer", "fpo") else "buyer_org" if role == "buyer" else "logistics"
            organization, _ = Organization.objects.get_or_create(
                name=org_name,
                defaults={"org_type": org_type, "location": location, "phone": validated_data.get("phone", "")},
            )

        user = User.objects.create_user(
            username=validated_data["username"],
            password=password,
            first_name=validated_data["first_name"],
            last_name=validated_data.get("last_name", ""),
            phone=validated_data.get("phone", ""),
            role=role,
            language=validated_data.get("language", "en"),
            organization=organization,
            is_verified=is_verified,
            pm_kisan_id=pm_kisan_id,
            khasra_number=khasra_number,
            land_size_acres=land_size_acres,
            tehsil=tehsil,
            kisan_verification_status=kisan_verification_status,
            kisan_verified_at=kisan_verified_at,
            kisan_verified_by=kisan_verified_by,
        )

        # Create real initial farm for farmer/fpo in Lucknow cluster
        if role in ("farmer", "fpo"):
            village = village_name or (location.split(",")[0].strip() if location else "Bakshi Ka Talab")
            Farm.objects.create(
                owner=user,
                name=org_name or f"{user.first_name}'s Farm",
                village=village,
                district="Lucknow",
                state="Uttar Pradesh",
                latitude=26.9124,
                longitude=80.8947,
                address=f"{village}, {tehsil or 'Bakshi Ka Talab'}, Lucknow, Uttar Pradesh",
            )

        return user
