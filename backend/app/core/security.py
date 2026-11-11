"""Băm và kiểm tra mật khẩu bằng scrypt (thư viện chuẩn, không cần cài thêm).

DB chỉ lưu chuỗi băm dạng  scrypt$n$r$p$salt_hex$hash_hex  — không bao giờ lưu mật khẩu gốc.
"""
import hashlib
import hmac
import secrets

_N, _R, _P = 2**14, 8, 1  # tham số chi phí scrypt (khuyến nghị OWASP cho đăng nhập)
_SALT_BYTES = 16
_KEY_BYTES = 32


def _derive(password: str, salt: bytes, n: int, r: int, p: int) -> bytes:
    return hashlib.scrypt(password.encode("utf-8"), salt=salt, n=n, r=r, p=p, dklen=_KEY_BYTES)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(_SALT_BYTES)
    digest = _derive(password, salt, _N, _R, _P)
    return f"scrypt${_N}${_R}${_P}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    """True nếu mật khẩu khớp chuỗi băm đã lưu. Chuỗi băm hỏng -> False (không ném lỗi)."""
    try:
        scheme, n, r, p, salt_hex, hash_hex = stored.split("$")
        if scheme != "scrypt":
            return False
        expected = bytes.fromhex(hash_hex)
        actual = _derive(password, bytes.fromhex(salt_hex), int(n), int(r), int(p))
    except (ValueError, AttributeError):
        return False
    return hmac.compare_digest(actual, expected)  # so sánh thời gian hằng


# Dùng khi email không tồn tại: vẫn băm 1 lần để thời gian phản hồi không lộ
# việc email đó đã đăng ký hay chưa.
DUMMY_HASH = hash_password(secrets.token_hex(16))


# --- Token phiên đăng nhập ---
def new_session_token() -> str:
    """Token ngẫu nhiên 256 bit, gửi cho FE và FE gửi lại qua header Authorization."""
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    """DB chỉ lưu SHA-256 của token (token đã đủ ngẫu nhiên nên không cần salt/scrypt)."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
