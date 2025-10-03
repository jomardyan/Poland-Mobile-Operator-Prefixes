"""
Example Usage of Polish Mobile Validator (Python)
This file demonstrates the main features of the validator
"""

import os
from polish_mobile_validator import PolishMobileValidator


def print_separator(char='=', length=70):
    """Print a separator line"""
    print(char * length)


def main():
    print_separator()
    print('Polish Mobile Number Validator - Python Examples')
    print_separator()
    print()

    # Initialize validator
    validator = PolishMobileValidator()

    # Load CSV database for detailed information
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'Mobileprefix.csv')
    validator_with_db = PolishMobileValidator(csv_path)

    # Test phone numbers
    test_numbers = [
        {'number': '501234567', 'description': 'Orange number'},
        {'number': '+48721234567', 'description': 'Play number with country code'},
        {'number': '881234567', 'description': 'T-Mobile number'},
        {'number': '211234567', 'description': 'Plus/M2M number'},
        {'number': '991234567', 'description': 'Invalid prefix'},
        {'number': '50123456', 'description': 'Invalid length'},
        {'number': '(501) 234-567', 'description': 'Number with formatting'}
    ]

    # Example 1: Validate and Recognize Operators
    print('EXAMPLE 1: Operator Recognition')
    print_separator('-')
    for test in test_numbers:
        result = validator.recognize_operator(test['number'])
        print(f"\nInput: {test['number']} ({test['description']})")
        print(f"Status: {'✓ Valid' if result['success'] else '✗ Invalid'}")
        
        if result['success']:
            print(f"  - Normalized: {result['normalized']}")
            print(f"  - Prefix: {result['prefix']}")
            print(f"  - Operator: {result['operator']}")
            print(f"  - M2M: {'Yes' if result['is_m2m'] else 'No'}")
        else:
            print(f"  - Error: {result['message']}")

    # Example 2: Phone Number Formatting
    print('\n')
    print_separator()
    print('EXAMPLE 2: Phone Number Formatting')
    print_separator('-')
    format_number = '501234567'
    print(f"\nOriginal: {format_number}")
    print(f"Standard:      {validator.format_phone_number(format_number, 'standard')}")
    print(f"International: {validator.format_phone_number(format_number, 'international')}")
    print(f"Spaced:        {validator.format_phone_number(format_number, 'spaced')}")

    # Example 3: Batch Validation
    print('\n')
    print_separator()
    print('EXAMPLE 3: Batch Validation')
    print_separator('-')
    batch_numbers = ['501234567', '721234567', '881234567', '211234567']
    print('\nValidating multiple numbers at once...')
    results = validator.batch_validate(batch_numbers)

    for result in results:
        icon = '✓' if result['success'] else '✗'
        operator = result['operator'] if result['success'] else 'Invalid'
        print(f"  {icon} {result['phone_number']:<15} → {operator}")

    # Example 4: M2M Detection
    print('\n')
    print_separator()
    print('EXAMPLE 4: M2M Detection')
    print_separator('-')
    m2m_test = ['211234567', '501234567', '721234567']
    print('\nChecking for Machine-to-Machine numbers...')
    for number in m2m_test:
        is_m2m = validator.is_m2m_number(number)
        result = validator.recognize_operator(number)
        print(f"  {number}: {'✓ M2M' if is_m2m else '✗ Regular'} ({result['operator']})")

    # Example 5: Operator Information
    print('\n')
    print_separator()
    print('EXAMPLE 5: Operator and Prefix Information')
    print_separator('-')
    print('\nValid prefixes:', ', '.join(validator.get_valid_prefixes()))
    print('\nOperator prefixes:')
    operator_prefixes = validator.get_operator_prefixes()
    for operator, prefixes in operator_prefixes.items():
        print(f"  {operator:<10}: {', '.join(prefixes)}")

    # Example 6: Database-Enhanced Recognition
    print('\n')
    print_separator()
    print('EXAMPLE 6: Detailed Operator Recognition (with CSV database)')
    print_separator('-')
    detailed_test = ['500123456', '572123456', '660123456']
    print('\nRecognizing with detailed database information...')
    for number in detailed_test:
        result = validator_with_db.recognize_operator(number)
        if result['success']:
            print(f"\n  {number}:")
            print(f"    Main Operator: {result['operator']}")
            if result['detailed_operator']:
                print(f"    Detailed Info: {result['detailed_operator']}")

    print('\n')
    print_separator()
    print('Examples completed!')
    print_separator()


if __name__ == '__main__':
    main()
