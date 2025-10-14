"""
Enhanced password security utilities.
"""
import re
import secrets
import string
from typing import List, Tuple
from passlib.context import CryptContext
from pydantic import BaseModel, validator

from app.core.config import settings

# Enhanced password hashing context
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Increased rounds for better security
)

# Password strength requirements
PASSWORD_REQUIREMENTS = {
    "min_length": 8,
    "max_length": 128,
    "require_uppercase": True,
    "require_lowercase": True,
    "require_digits": True,
    "require_special_chars": True,
    "min_special_chars": 1,
    "forbidden_patterns": [
        r"password",
        r"123456",
        r"qwerty",
        r"admin",
        r"user",
        r"login"
    ]
}

# Common weak passwords to check against
COMMON_WEAK_PASSWORDS = {
    "password", "123456", "123456789", "qwerty", "abc123",
    "password123", "admin", "letmein", "welcome", "monkey",
    "1234567890", "password1", "qwerty123", "dragon", "master"
}


class PasswordStrengthResult(BaseModel):
    """Password strength validation result."""
    is_valid: bool
    score: int  # 0-100
    issues: List[str]
    suggestions: List[str]


class PasswordValidator:
    """Enhanced password validator with strength checking."""
    
    @staticmethod
    def validate_password_strength(password: str) -> PasswordStrengthResult:
        """
        Validate password strength and return detailed results.
        
        Args:
            password: Password to validate
            
        Returns:
            PasswordStrengthResult: Detailed validation results
        """
        issues = []
        suggestions = []
        score = 0
        
        # Length check
        if len(password) < PASSWORD_REQUIREMENTS["min_length"]:
            issues.append(f"Password must be at least {PASSWORD_REQUIREMENTS['min_length']} characters long")
        else:
            score += 20
            
        if len(password) > PASSWORD_REQUIREMENTS["max_length"]:
            issues.append(f"Password must be no more than {PASSWORD_REQUIREMENTS['max_length']} characters long")
        else:
            score += 10
        
        # Character type checks
        if PASSWORD_REQUIREMENTS["require_uppercase"] and not re.search(r'[A-Z]', password):
            issues.append("Password must contain at least one uppercase letter")
        else:
            score += 15
            
        if PASSWORD_REQUIREMENTS["require_lowercase"] and not re.search(r'[a-z]', password):
            issues.append("Password must contain at least one lowercase letter")
        else:
            score += 15
            
        if PASSWORD_REQUIREMENTS["require_digits"] and not re.search(r'\d', password):
            issues.append("Password must contain at least one digit")
        else:
            score += 15
            
        if PASSWORD_REQUIREMENTS["require_special_chars"]:
            special_chars = re.findall(r'[!@#$%^&*(),.?":{}|<>]', password)
            if len(special_chars) < PASSWORD_REQUIREMENTS["min_special_chars"]:
                issues.append(f"Password must contain at least {PASSWORD_REQUIREMENTS['min_special_chars']} special character")
            else:
                score += 15
        
        # Pattern checks
        password_lower = password.lower()
        for pattern in PASSWORD_REQUIREMENTS["forbidden_patterns"]:
            if re.search(pattern, password_lower):
                issues.append(f"Password contains forbidden pattern: {pattern}")
                score -= 10
        
        # Common password check
        if password_lower in COMMON_WEAK_PASSWORDS:
            issues.append("Password is too common and easily guessable")
            score -= 20
        
        # Sequential character check
        if PasswordValidator._has_sequential_chars(password):
            issues.append("Password contains sequential characters")
            score -= 5
        
        # Repetitive character check
        if PasswordValidator._has_repetitive_chars(password):
            issues.append("Password contains too many repetitive characters")
            score -= 5
        
        # Generate suggestions
        if score < 70:
            suggestions = PasswordValidator._generate_suggestions(password, issues)
        
        return PasswordStrengthResult(
            is_valid=len(issues) == 0 and score >= 70,
            score=max(0, min(100, score)),
            issues=issues,
            suggestions=suggestions
        )
    
    @staticmethod
    def _has_sequential_chars(password: str) -> bool:
        """Check for sequential characters (abc, 123, etc.)."""
        for i in range(len(password) - 2):
            if (ord(password[i+1]) == ord(password[i]) + 1 and 
                ord(password[i+2]) == ord(password[i]) + 2):
                return True
        return False
    
    @staticmethod
    def _has_repetitive_chars(password: str) -> bool:
        """Check for repetitive characters."""
        for char in password:
            if password.count(char) > len(password) // 3:
                return True
        return False
    
    @staticmethod
    def _generate_suggestions(password: str, issues: List[str]) -> List[str]:
        """Generate password improvement suggestions."""
        suggestions = []
        
        if len(password) < PASSWORD_REQUIREMENTS["min_length"]:
            suggestions.append("Use a longer password (12+ characters recommended)")
        
        if not re.search(r'[A-Z]', password):
            suggestions.append("Add uppercase letters")
            
        if not re.search(r'[a-z]', password):
            suggestions.append("Add lowercase letters")
            
        if not re.search(r'\d', password):
            suggestions.append("Add numbers")
            
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            suggestions.append("Add special characters (!@#$%^&*)")
        
        suggestions.append("Avoid common words and personal information")
        suggestions.append("Consider using a passphrase instead of a password")
        
        return suggestions
    
    @staticmethod
    def generate_strong_password(length: int = 16) -> str:
        """
        Generate a cryptographically secure password.
        
        Args:
            length: Desired password length
            
        Returns:
            str: Strong password
        """
        if length < 8:
            length = 8
        
        # Character sets
        lowercase = string.ascii_lowercase
        uppercase = string.ascii_uppercase
        digits = string.digits
        special = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        
        # Ensure at least one character from each set
        password = [
            secrets.choice(lowercase),
            secrets.choice(uppercase),
            secrets.choice(digits),
            secrets.choice(special)
        ]
        
        # Fill the rest with random characters
        all_chars = lowercase + uppercase + digits + special
        for _ in range(length - 4):
            password.append(secrets.choice(all_chars))
        
        # Shuffle the password
        secrets.SystemRandom().shuffle(password)
        
        return ''.join(password)


def hash_password(plain_password: str) -> str:
    """
    Hash a password using enhanced bcrypt.
    
    Args:
        plain_password: Plain text password
        
    Returns:
        str: Hashed password
    """
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: Plain text password
        hashed_password: Hashed password
        
    Returns:
        bool: True if password matches
    """
    return pwd_context.verify(plain_password, hashed_password)


def check_password_strength(password: str) -> Tuple[bool, str]:
    """
    Quick password strength check for API responses.
    
    Args:
        password: Password to check
        
    Returns:
        Tuple[bool, str]: (is_valid, message)
    """
    result = PasswordValidator.validate_password_strength(password)
    
    if result.is_valid:
        return True, "Password is strong"
    else:
        return False, "; ".join(result.issues[:3])  # Limit to first 3 issues
