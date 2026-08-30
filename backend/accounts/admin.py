"""Admin configuration for accounts."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ["name", "org_type", "location"]


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["username", "role", "organization", "language", "is_verified"]
    list_filter = ["role", "is_verified", "language"]
    fieldsets = BaseUserAdmin.fieldsets + (
        ("FarmLink", {"fields": ("role", "phone", "organization", "language", "is_verified")}),
    )
