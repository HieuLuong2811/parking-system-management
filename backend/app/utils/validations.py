import re

DOMAIN_REGEX = re.compile(r"^[a-z0-9-]+(?:\.[a-z0-9-]+)+$")

def is_valid_domain(email: str) -> bool:
    domain_part = email.split("@", 1)[-1].strip().lower()
    return bool(domain_part and DOMAIN_REGEX.fullmatch(domain_part))


def normalize_phone_text(value: str) -> str:
    return "".join(ch for ch in value if ch.isdigit())
