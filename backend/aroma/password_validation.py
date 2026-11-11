from django.core.exceptions import ValidationError


class PasswordComplexityValidator:
    def validate(self, password, user=None):
        has_letter = any(character.isalpha() for character in password)
        has_digit = any(character.isdecimal() for character in password)
        has_symbol = any(not character.isalnum() and not character.isspace() for character in password)
        if not (has_letter and has_digit and has_symbol):
            raise ValidationError(self.get_help_text(), code="password_not_complex")

    def get_help_text(self):
        return "Your password must contain at least one letter, one digit, and one symbol."
