# Poland Mobile Operator Prefixes

# Poland-Mobile-Operator-Prefixes

A comprehensive validation and operator recognition framework for Polish mobile phone numbers. This repository provides both JavaScript and Python implementations with full unit test coverage.Numeracja komórkowa w Polsce - operatorzy i przydzielone im zakresy numeracyjne [aktualizacja 24.01.2022]

W Polsce numeracja komórkowa składa się z 9-ciu cyfr. Numeracja sieci komórkowych w Polsce posiada wyróżniki sieci (początkowe dwie cyfry): 21, 45, 50, 51, 53, 57, 60, 66, 69, 72, 73, 78, 79, 88, przy czym numeracja "21" jest przeznaczona dla połączeń typu Machine to Machine (M2M).

## Overview*****************************

**Cellular numbering in Poland - operators and their assigned numbering ranges [updated on January 24, 2022]**

**Polish mobile numbering consists of 9 digits.** The numbering of mobile networks in Poland has network identifiers (the first two digits): **21, 45, 50, 51, 53, 57, 60, 66, 69, 72, 73, 78, 79, 88**.

In Poland, cellular numbering consists of 9 digits. The numbering of mobile networks in Poland has network identifiers (the first two digits): 21, 45, 50, 51, 53, 57, 60, 66, 69, 72, 73, 78, 79, 88, where the numbering "21" is intended for Machine to Machine (M2M) connections.

The numbering **"21"** is reserved for **Machine to Machine (M2M)** connections, used for devices that do not require human interaction (alarm systems, smart meters, industrial control systems, etc.).

**Operators and their assigned numbering ranges:**

*Last updated: January 24, 2022*

 - **Play**: 50, 51, 53, 60, 72, 73, 78, 79

--- - **Orange**: 57, 66, 69

 - **T-Mobile**: 45, 88

## Operators and Prefixes - **Plus**: 21



| Operator | Market Share | Prefixes |**Details:**

|----------|-------------|----------|

| **Play** | >30% | 53, 60, 72, 73, 78, 79 |-   **Play:** The largest mobile operator in Poland, with a market share of over 30%.

| **Orange** | >25% | 50, 51, 57, 66, 69 |-   **Orange:** The second largest mobile operator in Poland, with a market share of over 25%.

| **T-Mobile** | >20% | 45, 88 |-   **T-Mobile:** The third largest mobile operator in Poland, with a market share of over 20%.

| **Plus** | >20% | 21 (M2M) |-   **Plus:** The fourth largest mobile operator in Poland, with a market share of over 20%.



### Operator Details**Notes**:

The numbering "21" is reserved for Machine to Machine (M2M) connections, which are used for devices that do not require human interaction, such as alarm systems, smart meters, and industrial control systems.

- **Play**: The largest mobile operator in PolandThe numbering ranges may change in the future.

- **Orange**: The second largest mobile operator in Poland
- **T-Mobile**: The third largest mobile operator in Poland
- **Plus**: The fourth largest mobile operator in Poland

---

## Features

Both JavaScript and Python implementations provide:

✅ **Phone Number Validation** - Validate Polish mobile numbers (9 digits)  
✅ **Operator Recognition** - Identify the mobile operator from the prefix  
✅ **M2M Detection** - Detect Machine-to-Machine connections  
✅ **Number Normalization** - Clean and standardize phone numbers  
✅ **Number Formatting** - Format numbers in multiple styles (standard, international, spaced)  
✅ **Batch Processing** - Validate multiple numbers at once  
✅ **CSV Database Support** - Load detailed prefix data from CSV  
✅ **Full Test Coverage** - Comprehensive unit tests included

---

## Installation & Usage

### JavaScript

#### Installation

```bash
cd javascript
npm install
```

#### Basic Usage

```javascript
const PolishMobileValidator = require('./polishMobileValidator');

// Initialize validator
const validator = new PolishMobileValidator();

// Or with CSV database
const validatorWithDB = new PolishMobileValidator('../Mobileprefix.csv');

// Validate a phone number
const result = validator.recognizeOperator('501234567');
console.log(result);
// {
//   success: true,
//   phoneNumber: '501234567',
//   normalized: '501234567',
//   prefix: '50',
//   operator: 'Orange',
//   detailedOperator: null,
//   isM2M: false,
//   message: 'Operator: Orange'
// }

// Format phone number
console.log(validator.formatPhoneNumber('501234567', 'international'));
// Output: +48 501 234 567

// Check if M2M
console.log(validator.isM2MNumber('211234567')); // true

// Batch validate
const numbers = ['501234567', '721234567', '881234567'];
const results = validator.batchValidate(numbers);
```

#### Run Tests

```bash
cd javascript
npm test
```

#### API Reference (JavaScript)

**Methods:**

- `normalizePhoneNumber(phoneNumber)` - Normalize phone number to 9 digits
- `validatePhoneNumber(phoneNumber)` - Validate phone number structure
- `recognizeOperator(phoneNumber)` - Get complete operator information
- `getOperatorByPrefix(prefix)` - Get operator name by 2-digit prefix
- `isM2MNumber(phoneNumber)` - Check if number is M2M
- `getValidPrefixes()` - Get list of all valid prefixes
- `getOperatorPrefixes()` - Get mapping of operators to prefixes
- `batchValidate(phoneNumbers)` - Validate multiple numbers
- `formatPhoneNumber(phoneNumber, format)` - Format number (standard/international/spaced)
- `loadPrefixDatabase(csvPath)` - Load detailed prefix database from CSV

---

### Python

#### Installation

```bash
cd python
pip install -r requirements.txt
```

#### Basic Usage

```python
from polish_mobile_validator import PolishMobileValidator

# Initialize validator
validator = PolishMobileValidator()

# Or with CSV database
validator_with_db = PolishMobileValidator('../Mobileprefix.csv')

# Validate a phone number
result = validator.recognize_operator('501234567')
print(result)
# {
#   'success': True,
#   'phone_number': '501234567',
#   'normalized': '501234567',
#   'prefix': '50',
#   'operator': 'Orange',
#   'detailed_operator': None,
#   'is_m2m': False,
#   'message': 'Operator: Orange'
# }

# Format phone number
print(validator.format_phone_number('501234567', 'international'))
# Output: +48 501 234 567

# Check if M2M
print(validator.is_m2m_number('211234567'))  # True

# Batch validate
numbers = ['501234567', '721234567', '881234567']
results = validator.batch_validate(numbers)
```

#### Run Tests

```bash
cd python
python test_polish_mobile_validator.py

# Or with pytest
pytest test_polish_mobile_validator.py -v
```

#### Run Example

```bash
cd python
python polish_mobile_validator.py
```

#### API Reference (Python)

**Methods:**

- `normalize_phone_number(phone_number)` - Normalize phone number to 9 digits
- `validate_phone_number(phone_number)` - Validate phone number structure
- `recognize_operator(phone_number)` - Get complete operator information
- `get_operator_by_prefix(prefix)` - Get operator name by 2-digit prefix
- `is_m2m_number(phone_number)` - Check if number is M2M
- `get_valid_prefixes()` - Get list of all valid prefixes
- `get_operator_prefixes()` - Get mapping of operators to prefixes
- `batch_validate(phone_numbers)` - Validate multiple numbers
- `format_phone_number(phone_number, format_type)` - Format number (standard/international/spaced)
- `load_prefix_database(csv_path)` - Load detailed prefix database from CSV

---

## Examples

### Validate and Recognize Operator

**JavaScript:**
```javascript
const validator = new PolishMobileValidator();

// Valid Orange number
validator.recognizeOperator('501234567');
// { success: true, operator: 'Orange', isM2M: false }

// Valid Play number
validator.recognizeOperator('721234567');
// { success: true, operator: 'Play', isM2M: false }

// M2M number
validator.recognizeOperator('211234567');
// { success: true, operator: 'Plus', isM2M: true }

// Invalid number
validator.recognizeOperator('991234567');
// { success: false, message: 'Invalid prefix: 99...' }
```

**Python:**
```python
validator = PolishMobileValidator()

# Valid Orange number
validator.recognize_operator('501234567')
# {'success': True, 'operator': 'Orange', 'is_m2m': False}

# Valid Play number
validator.recognize_operator('721234567')
# {'success': True, 'operator': 'Play', 'is_m2m': False}

# M2M number
validator.recognize_operator('211234567')
# {'success': True, 'operator': 'Plus', 'is_m2m': True}

# Invalid number
validator.recognize_operator('991234567')
# {'success': False, 'message': 'Invalid prefix: 99...'}
```

### Format Phone Numbers

**JavaScript:**
```javascript
const validator = new PolishMobileValidator();
const number = '501234567';

validator.formatPhoneNumber(number, 'standard');      // '501234567'
validator.formatPhoneNumber(number, 'international'); // '+48 501 234 567'
validator.formatPhoneNumber(number, 'spaced');        // '501 234 567'
```

**Python:**
```python
validator = PolishMobileValidator()
number = '501234567'

validator.format_phone_number(number, 'standard')       # '501234567'
validator.format_phone_number(number, 'international')  # '+48 501 234 567'
validator.format_phone_number(number, 'spaced')         # '501 234 567'
```

### Batch Processing

**JavaScript:**
```javascript
const validator = new PolishMobileValidator();
const numbers = [
    '501234567',  // Orange
    '721234567',  // Play
    '881234567',  // T-Mobile
    '991234567'   // Invalid
];

const results = validator.batchValidate(numbers);
results.forEach(result => {
    console.log(`${result.phoneNumber}: ${result.success ? result.operator : 'Invalid'}`);
});
```

**Python:**
```python
validator = PolishMobileValidator()
numbers = [
    '501234567',  # Orange
    '721234567',  # Play
    '881234567',  # T-Mobile
    '991234567'   # Invalid
]

results = validator.batch_validate(numbers)
for result in results:
    status = result['operator'] if result['success'] else 'Invalid'
    print(f"{result['phone_number']}: {status}")
```

---

## Testing

Both implementations include comprehensive unit tests:

### JavaScript Tests (38 tests)
- ✅ Phone number normalization
- ✅ Phone number validation
- ✅ Operator recognition
- ✅ M2M detection
- ✅ Prefix operations
- ✅ Batch validation
- ✅ Phone number formatting
- ✅ Edge cases
- ✅ CSV database loading

**Coverage: 97.14% statements, 90.47% branches**

### Python Tests (46 tests)
- ✅ Phone number normalization
- ✅ Phone number validation
- ✅ Operator recognition
- ✅ M2M detection
- ✅ Prefix operations
- ✅ Batch validation
- ✅ Phone number formatting
- ✅ Edge cases
- ✅ CSV database loading

---

## Project Structure

```
Poland-Mobile-Operator-Prefixes/
├── README.md                       # This file
├── Mobileprefix.csv               # Detailed prefix database
├── javascript/
│   ├── package.json               # Node.js dependencies
│   ├── polishMobileValidator.js   # Main validator module
│   └── polishMobileValidator.test.js # Unit tests (Jest)
└── python/
    ├── requirements.txt           # Python dependencies
    ├── polish_mobile_validator.py # Main validator module
    └── test_polish_mobile_validator.py # Unit tests (unittest)
```

---

## Data Source

The prefix database (`Mobileprefix.csv`) contains detailed mappings of prefixes to specific operators and services. The data is regularly updated to reflect changes in the Polish telecommunications market.

---

## Notes

⚠️ **Important Considerations:**

- The numbering ranges may change in the future as new prefixes are allocated
- Some prefixes have been reassigned between operators over time
- The M2M prefix (21) is reserved for machine-to-machine communications
- Virtual Mobile Network Operators (MVNOs) may use prefixes from their host network

---

## License

MIT License

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

## Changelog

### Version 1.0.0 (2025)
- Initial release with JavaScript and Python implementations
- Comprehensive validation and operator recognition
- Full unit test coverage
- Support for CSV database loading
- Multiple phone number formatting options
- Batch processing capabilities

---

**Developed for validating and recognizing Polish mobile operators** 🇵🇱📱
