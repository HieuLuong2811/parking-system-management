from app.models.roles import Roles
from app.enums.parking import ParkingAccessCardHolderType, UserType
from app.models.parking_access_cards import ParkingAccessCard
from sqlalchemy import select
from app.models.user_roles import UserRoles
from app.models.users import Users, RoleSummary

def build_user_with_roles_stmt():
        return (
            select(Users, Roles)
            .outerjoin(UserRoles, UserRoles.user_code == Users.user_code)
            .outerjoin(Roles, Roles.id == UserRoles.role_id)
        )

def map_users_with_roles(rows):
    users_dict: dict[str, dict] = {}

    for user, role in rows:
        if user.user_code not in users_dict:
            users_dict[user.user_code] = {
                "user": user,
                "roles": [],
            }

        if role is not None:
            users_dict[user.user_code]["roles"].append(
                RoleSummary(id=role.id, role_code=role.role_code)
            )

    return list(users_dict.values())

def _resolve_user_type_from_card(card: ParkingAccessCard) -> UserType:
    if card.holder_type == ParkingAccessCardHolderType.GUEST:
        return UserType.GUEST

    if card.holder_type == ParkingAccessCardHolderType.TEACHER:
        teacher_type = getattr(UserType, "TEACHER", None)
        return teacher_type or UserType.STUDENT

    return UserType.STUDENT
