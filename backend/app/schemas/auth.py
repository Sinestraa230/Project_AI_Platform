"""Schema cho /api/auth."""
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(default="", max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserOut(BaseModel):
    """Thông tin người dùng trả về FE — không bao giờ chứa mật khẩu/chuỗi băm."""

    id: int
    email: str
    full_name: str
    created_at: str


class SessionOut(BaseModel):
    """Trả về khi đăng nhập thành công: token dùng cho header Authorization: Bearer <token>."""

    message: str
    access_token: str
    token_type: str = "bearer"
    expires_at: str
    user: UserOut
