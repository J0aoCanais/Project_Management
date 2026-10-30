
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError


# ----------------------------------------------------------------------------
# Password hashing
# ----------------------------------------------------------------------------

ph = PasswordHasher()  # Argon2id with sensible defaults

def hash_password(plain: str) -> str:
    return ph.hash(plain)

def verify_password(stored_hash: str, plain: str) -> bool:
    try:
        return ph.verify(stored_hash, plain)
    except (VerificationError, InvalidHashError):
        return False