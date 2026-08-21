import base64
import hashlib
import os
import hmac

from passlib.context import CryptContext

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_hash(data: str) -> tuple[str, str]:
    salt = os.urandom(12)
    salted = salt + data.encode()
    hashed = hashlib.sha256(salted).hexdigest()
    return base64.b64encode(salt).decode(), hashed

def verify_hash(data: str, hash_value: str, salt: str) -> bool:
    salt_bytes = base64.b64decode(salt)
    gen_hash = hashlib.sha256(salt_bytes + data.encode()).hexdigest()
    return hmac.compare_digest(gen_hash, hash_value)

def get_password_hash(password: str) -> str:
    return bcrypt_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt_context.verify(plain_password, hashed_password)
