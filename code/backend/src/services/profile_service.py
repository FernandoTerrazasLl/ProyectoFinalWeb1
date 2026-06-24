from typing import Dict, Any
import src.models.domain as models

def build_user_profile_response(user: models.User) -> Dict[str, Any]:
    """
    Constructs a dictionary response for a user profile.
    """
    return {
        "first_name": user.first_name or "",
        "last_name": user.last_name or "",
        "maternal_last_name": user.maternal_last_name or "",
        "ci": user.ci or "",
        "birth_date": user.birth_date,
        "gender": user.gender,
        "phone_number": user.phone_number or "",
        "email": user.email,
        "avatar_url": user.avatar_url or ""
    }

def build_provider_profile_response(provider: models.ProviderProfile) -> Dict[str, Any]:
    """
    Constructs a dictionary response for a provider profile, including user details.
    """
    user_data = build_user_profile_response(provider.user)
    provider_data = {
        "bio": provider.bio or "",
        "session_price": float(provider.session_price) if provider.session_price else 0.0,
        "tags": [tag.name for tag in provider.tags],
        "specialty": provider.specialty.name if provider.specialty else None,
        "office_address": getattr(provider, "office_address", "")
    }
    return {**user_data, **provider_data}
