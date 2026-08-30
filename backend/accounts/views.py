"""Auth views: login (JWT), registration, current user, and role bootstrap."""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    POST /api/auth/login/
    Body: { "username": "...", "password": "..." }
    Returns JWT tokens + user profile with role.
    """
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data["user"]

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data,
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    """
    POST /api/auth/register/
    Body: {
      "username": "kisan_vikas",
      "password": "...",
      "first_name": "Vikas",
      "last_name": "Yadav",
      "phone": "+91-9876543210",
      "role": "farmer",
      "organization_name": "Lucknow Organic Producers",
      "location": "Chinhat, Lucknow"
    }
    Returns JWT tokens + registered user profile.
    """
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    """
    GET /api/auth/me/
    Returns the current authenticated user's profile.
    """
    return Response(UserSerializer(request.user).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_language(request):
    """
    PATCH /api/auth/language/
    Body: { "language": "hi" }
    Updates user's preferred language.
    """
    language = request.data.get("language", "en")
    if language not in ("en", "hi"):
        return Response(
            {"error": "Supported languages: en, hi"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    request.user.language = language
    request.user.save(update_fields=["language"])
    return Response(UserSerializer(request.user).data)


@api_view(["POST"])
@permission_classes([AllowAny])
def google_auth_view(request):
    """
    POST /api/auth/google/
    Body: {
      "email": "user@gmail.com",
      "name": "Vikas Yadav",
      "role": "buyer" | "farmer" | "ops" | "driver",
      "avatar_url": "optional"
    }
    Finds or creates real user in database and returns JWT session tokens.
    """
    import json
    import time
    import urllib.request
    import urllib.parse
    from accounts.models import User
    from lots.models import Farm

    id_token = request.data.get("id_token") or request.data.get("credential")
    email = request.data.get("email", "").strip().lower()
    name = request.data.get("name", "").strip()
    role = request.data.get("role", "buyer")
    avatar_url = request.data.get("avatar_url", "")

    # If real Google ID token provided, verify with Google OAuth endpoint
    if id_token:
        try:
            url = f"https://oauth2.googleapis.com/tokeninfo?id_token={urllib.parse.quote(id_token)}"
            req = urllib.request.Request(url, headers={"User-Agent": "FarmLink-Server"})
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    token_info = json.loads(response.read().decode("utf-8"))
                    email = token_info.get("email", "").strip().lower()
                    name = token_info.get("name") or name
                    avatar_url = token_info.get("picture") or avatar_url
        except Exception as e:
            print("Google token verification warning:", e)

    if not name:
        name = "Google User"

    if not email:
        email = f"google_user_{int(time.time())}@gmail.com"

    username = email.split("@")[0].replace(".", "_")

    user = User.objects.filter(email=email).first()
    if not user:
        user = User.objects.filter(username=username).first()

    if not user:
        parts = name.split(" ")
        first_name = parts[0]
        last_name = " ".join(parts[1:]) if len(parts) > 1 else ""

        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=email,
            password=f"GAuth_{email}_Secure!",
            first_name=first_name,
            last_name=last_name,
            role=role,
            avatar_url=avatar_url,
            is_verified=True,
            phone="+91-9876543210",
        )

        if role in ("farmer", "fpo"):
            Farm.objects.create(
                owner=user,
                name=f"{first_name}'s Farm",
                village="Bakshi Ka Talab",
                district="Lucknow",
                state="Uttar Pradesh",
                latitude=26.9124,
                longitude=80.8947,
                address="Bakshi Ka Talab, Lucknow, Uttar Pradesh",
            )
    else:
        if role and user.role != role:
            user.role = role
            user.save(update_fields=["role"])

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data,
    }, status=status.HTTP_200_OK)

