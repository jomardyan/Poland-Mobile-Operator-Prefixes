"""
Polish Mobile Number Validator and Operator Recognition Framework
Based on Poland Mobile Operator Prefixes database
Updated: January 24, 2022
"""

import re
import csv
from typing import Dict, List, Optional, Tuple


class PolishMobileValidator:
    """
    A comprehensive validator and operator recognition framework for Polish mobile numbers.
    """

    def __init__(self, csv_path: Optional[str] = None):
        """
        Initialize the validator with optional CSV database.
        
        Args:
            csv_path: Optional path to CSV file containing prefix database
        """
        self.prefix_database: Dict[str, str] = {}
        self.operator_prefixes = {
            'Play': ['53', '60', '72', '73', '78', '79'],
            'Orange': ['50', '51', '57', '66', '69'],
            'T-Mobile': ['45', '88'],
            'Plus': ['21']
        }
        self.valid_prefixes = ['21', '45', '50', '51', '53', '57', '60', '66', '69', '72', '73', '78', '79', '88']
        
        if csv_path:
            self.load_prefix_database(csv_path)

    def load_prefix_database(self, csv_path: str) -> None:
        """
        Load prefix database from CSV file.
        
        Args:
            csv_path: Path to the CSV file
        """
        try:
            with open(csv_path, 'r', encoding='utf-8', errors='ignore') as file:
                reader = csv.reader(file, delimiter=';')
                next(reader)  # Skip header
                
                for row in reader:
                    if len(row) >= 2:
                        prefix = row[0].replace('+48', '').strip()
                        operator = row[1].strip()
                        if prefix and operator:
                            self.prefix_database[prefix] = operator
        except Exception as e:
            print(f"Error loading CSV file: {e}")

    def normalize_phone_number(self, phone_number: Optional[str]) -> str:
        """
        Normalize phone number to standard format.
        
        Args:
            phone_number: Phone number to normalize
            
        Returns:
            Normalized phone number (9 digits)
        """
        if not phone_number:
            return ''
        
        # Remove all non-digit characters
        normalized = re.sub(r'\D', '', str(phone_number))
        
        # Remove country code if present
        if normalized.startswith('48') and len(normalized) > 9:
            normalized = normalized[2:]
        
        return normalized

    def validate_phone_number(self, phone_number: str) -> Dict[str, any]:
        """
        Validate if the phone number is a valid Polish mobile number.
        
        Args:
            phone_number: Phone number to validate
            
        Returns:
            Dictionary containing validation result with status and message
        """
        normalized = self.normalize_phone_number(phone_number)
        
        # Check if the number has 9 digits
        if len(normalized) != 9:
            return {
                'valid': False,
                'message': 'Polish mobile numbers must have exactly 9 digits',
                'normalized': normalized
            }
        
        # Check if the first two digits are valid
        prefix = normalized[:2]
        if prefix not in self.valid_prefixes:
            return {
                'valid': False,
                'message': f'Invalid prefix: {prefix}. Valid prefixes are: {", ".join(self.valid_prefixes)}',
                'normalized': normalized,
                'prefix': prefix
            }
        
        return {
            'valid': True,
            'message': 'Valid Polish mobile number',
            'normalized': normalized,
            'prefix': prefix
        }

    def recognize_operator(self, phone_number: str) -> Dict[str, any]:
        """
        Recognize the operator from phone number.
        
        Args:
            phone_number: Phone number to check
            
        Returns:
            Dictionary containing operator information
        """
        validation = self.validate_phone_number(phone_number)
        
        if not validation['valid']:
            return {
                'success': False,
                'message': validation['message'],
                'phone_number': phone_number
            }
        
        normalized = validation['normalized']
        prefix = validation['prefix']
        
        # Try to find exact match in database
        detailed_operator = None
        for i in range(len(normalized), 1, -1):
            test_prefix = normalized[:i]
            if test_prefix in self.prefix_database:
                detailed_operator = self.prefix_database[test_prefix]
                break
        
        # Determine main operator from 2-digit prefix
        main_operator = 'Unknown'
        for operator, prefixes in self.operator_prefixes.items():
            if prefix in prefixes:
                main_operator = operator
                break
        
        # Check if it's M2M
        is_m2m = prefix == '21'
        
        return {
            'success': True,
            'phone_number': phone_number,
            'normalized': normalized,
            'prefix': prefix,
            'operator': main_operator,
            'detailed_operator': detailed_operator,
            'is_m2m': is_m2m,
            'message': 'Machine to Machine (M2M) connection' if is_m2m else f'Operator: {main_operator}'
        }

    def get_operator_by_prefix(self, prefix: str) -> str:
        """
        Get operator by prefix.
        
        Args:
            prefix: Two-digit prefix
            
        Returns:
            Operator name
        """
        for operator, prefixes in self.operator_prefixes.items():
            if prefix in prefixes:
                return operator
        return 'Unknown'

    def is_m2m_number(self, phone_number: str) -> bool:
        """
        Check if prefix is for M2M connections.
        
        Args:
            phone_number: Phone number to check
            
        Returns:
            True if M2M, False otherwise
        """
        normalized = self.normalize_phone_number(phone_number)
        return normalized.startswith('21')

    def get_valid_prefixes(self) -> List[str]:
        """
        Get all valid prefixes.
        
        Returns:
            List of valid prefixes
        """
        return self.valid_prefixes.copy()

    def get_operator_prefixes(self) -> Dict[str, List[str]]:
        """
        Get all operators and their prefixes.
        
        Returns:
            Dictionary of operators and their prefixes
        """
        return {k: v.copy() for k, v in self.operator_prefixes.items()}

    def batch_validate(self, phone_numbers: List[str]) -> List[Dict[str, any]]:
        """
        Batch validate multiple phone numbers.
        
        Args:
            phone_numbers: List of phone numbers
            
        Returns:
            List of validation results
        """
        return [self.recognize_operator(number) for number in phone_numbers]

    def format_phone_number(self, phone_number: str, format_type: str = 'standard') -> str:
        """
        Format phone number for display.
        
        Args:
            phone_number: Phone number to format
            format_type: Format type ('standard', 'international', 'spaced')
            
        Returns:
            Formatted phone number
        """
        normalized = self.normalize_phone_number(phone_number)
        
        if len(normalized) != 9:
            return phone_number
        
        if format_type == 'international':
            return f'+48 {normalized[:3]} {normalized[3:6]} {normalized[6:]}'
        elif format_type == 'spaced':
            return f'{normalized[:3]} {normalized[3:6]} {normalized[6:]}'
        else:  # standard
            return normalized


# Example usage
if __name__ == '__main__':
    # Initialize validator
    validator = PolishMobileValidator()
    
    # Test phone numbers
    test_numbers = [
        '501234567',    # Orange
        '+48721234567', # Play
        '881234567',    # T-Mobile
        '211234567',    # Plus (M2M)
        '991234567'     # Invalid
    ]
    
    print("Polish Mobile Number Validator - Examples\n")
    print("=" * 60)
    
    for number in test_numbers:
        result = validator.recognize_operator(number)
        print(f"\nPhone Number: {number}")
        print(f"Status: {'✓ Valid' if result['success'] else '✗ Invalid'}")
        
        if result['success']:
            print(f"Normalized: {result['normalized']}")
            print(f"Prefix: {result['prefix']}")
            print(f"Operator: {result['operator']}")
            print(f"M2M: {'Yes' if result['is_m2m'] else 'No'}")
            print(f"Formatted (International): {validator.format_phone_number(number, 'international')}")
        else:
            print(f"Error: {result['message']}")
    
    print("\n" + "=" * 60)
