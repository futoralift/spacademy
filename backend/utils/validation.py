import phonenumbers
from phonenumbers import NumberParseException


def normalize_phone(phone: str):
    try:
        parsed = phonenumbers.parse(phone, "IN")

        if not (phonenumbers.is_valid_number(parsed) or phonenumbers.is_possible_number(parsed)):
            return None

        return phonenumbers.format_number(
            parsed,
            phonenumbers.PhoneNumberFormat.E164
        )
    except NumberParseException:
        return None
