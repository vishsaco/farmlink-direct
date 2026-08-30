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

    class Meta:
        model = User
        fields = [
            "id", "username", "first_name", "last_name", "email",
            "role", "phone", "organization", "organization_detail",
            "language", "is_verified", "avatar_url",
        ]
        read_only_fields = ["id", "is_verified"]


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

    def validate_username(self, value):
        cleaned_val = value.strip()
        if not cleaned_val:
            raise serializers.ValidationError("Username cannot be blank.")
        if User.objects.filter(username__iexact=cleaned_val).exists():
            raise serializers.ValidationError(f"Username '{cleaned_val}' is already registered. Please choose another username or sign in.")
        return cleaned_val

    def create(self, validated_data):
        org_name = validated_data.pop("organization_name", "").strip()
        location = validated_data.pop("location", "Bakshi Ka Talab, Lucknow").strip()
        password = validated_data.pop("password")
        role = validated_data.get("role")

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
            is_verified=True,
        )

        # Create real initial farm for farmer/fpo in Lucknow cluster
        if role in ("farmer", "fpo"):
            village = location.split(",")[0].strip() if location else "Bakshi Ka Talab"
            Farm.objects.create(
                owner=user,
                name=org_name or f"{user.first_name}'s Farm",
                village=village,
                district="Lucknow",
                state="Uttar Pradesh",
                latitude=26.9124,
                longitude=80.8947,
                address=f"{village}, Lucknow, Uttar Pradesh",
            )

        return user
