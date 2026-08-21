from data.schemas import User, PendingUser
from utils.models.pydantic_cm import UserModel, PendingUserModel


def user_2_p(user: User) -> UserModel:
    return UserModel(
        id=user.id,
        firstName=user.firstName,
        lastName=user.lastName,
        email=user.email,
        passwordHash=user.passwordHash,
        authServiceProvider=user.authServiceProvider,
        role=user.role,
        avatar=user.avatar,
        refreshToken=user.refreshToken,
        createdAt=user.createdAt,
        deletedAt=user.deletedAt,
        lastLogIn=user.lastLogIn,
        phone=user.phone,
    )

def user_2_s(user: UserModel) -> User:
    return User(
        id=user.id,
        firstName=user.firstName,
        lastName=user.lastName,
        email=user.email,
        passwordHash=user.passwordHash,
        authServiceProvider=user.authServiceProvider,
        role=user.role,
        avatar=user.avatar,
        refreshToken=user.refreshToken,
        createdAt=user.createdAt,
        deletedAt=user.deletedAt,
        lastLogIn=user.lastLogIn,
        phone=user.phone,
    )

def pend_user_2_p(pend_user: PendingUser) -> PendingUserModel:
    return PendingUserModel(
        id=pend_user.id,
        firstName=pend_user.firstName,
        lastName=pend_user.lastName,
        email=pend_user.email,
        passwordHash=pend_user.passwordHash,
        authServiceProvider=pend_user.authServiceProvider,
        role=pend_user.role,
        phone=pend_user.phone
    )

def pend_user_2_s(pend_user: PendingUserModel) -> PendingUser:
    return PendingUser(
        id=pend_user.id,
        firstName=pend_user.firstName,
        lastName=pend_user.lastName,
        email=pend_user.email,
        passwordHash=pend_user.passwordHash,
        authServiceProvider=pend_user.authServiceProvider,
        role=pend_user.role,
        phone=pend_user.phone
    )

