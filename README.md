# Poland Mobile Operator Prefixes

[![Test App Functionalities](https://github.com/jomardyan/Poland-Mobile-Operator-Prefixes/workflows/Test%20App%20Functionalities/badge.svg)](https://github.com/jomardyan/Poland-Mobile-Operator-Prefixes/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue)](https://www.python.org/)

End-to-end utilities for validating Polish mobile numbers, identifying the owning network, detecting M2M ranges, and formatting the number for display. The codebase ships parallel implementations for Node.js, the browser, and Python, together with CSV datasets sourced from UKE.

**Opis po polsku:** Biblioteka do walidacji i identyfikacji operatorów polskich numerów komórkowych (9 cyfr) wraz z obsługą formatowania oraz zestawem danych prefiksów (aktualizacja: 24 stycznia 2022).

## Highlights

- Validator and operator lookup for both JavaScript (Node.js + browser) and Python
- Machine-to-Machine detection for prefixes 21 and 69
- Formatting helpers for standard, spaced, and +48 international output
- Batch validation utilities for working with CSV exports or API payloads
- Optional detailed operator mapping via `Mobileprefix_corrected.csv`
- Jest and unittest/pytest suites with coverage reports (about 97 percent statements in latest run)

## Dataset

- `Mobileprefix.csv` contains the raw prefix to operator listing as published.
- `Mobileprefix_corrected.csv` normalises the same data and is the recommended source.
- Prefix ranges cover 21, 45, 50, 51, 53, 57, 60, 66, 69, 72, 73, 78, 79, 88. Ranges may shift; update the CSVs when UKE releases new allocations.

## Requirements

- Node.js 16 or newer
- Python 3.8 or newer

## Getting Started

### JavaScript (Node.js)

```bash
cd javascript
npm install
```

```javascript
const path = require('path');
const PolishMobileValidator = require('./polishMobileValidator');

const validator = new PolishMobileValidator(
  path.join(__dirname, '../Mobileprefix_corrected.csv')
);

const result = validator.recognizeOperator('501234567');
if (result.success) {
  console.log(result.operator);        // Orange
  console.log(result.isM2M);           // false
  console.log(validator.formatPhoneNumber(result.normalized, 'international'));
  // +48 501 234 567
} else {
  console.error(result.message);
}
```

### Browser (vanilla JS)

```html
<script src="polishMobileValidatorBrowser.js"></script>
<input id="mobile" placeholder="501234567" />
<div id="status"></div>
<script>
const validator = new PolishMobileValidatorBrowser({
  realTimeValidation: true,
  debounceDelay: 250
});

validator.attachToInput('#mobile', {
  displayElement: '#status',
  formatOnBlur: true,
  format: 'spaced',
  onValidate: (res) => {
    console.log(res.success ? res.operator : res.message);
  }
});
</script>
```

Open `javascript/demo.html` for a full in-browser example.

### Python

```bash
cd python
pip install -r requirements.txt
```

```python
from polish_mobile_validator import PolishMobileValidator
import os

data_file = os.path.join(os.path.dirname(__file__), '..', 'Mobileprefix_corrected.csv')
validator = PolishMobileValidator(data_file)

result = validator.recognize_operator('721234567')
if result['success']:
    print(result['operator'])  # Play
    print(validator.format_phone_number(result['normalized'], 'international'))
else:
    print(result['message'])
```

## API Snapshot

- `normalizePhoneNumber`, `normalize_phone_number`: strip non-digits and optional +48.
- `validatePhoneNumber`, `validate_phone_number`: ensure 9-digit mobile numbers and a known prefix.
- `recognizeOperator`, `recognize_operator`: return operator, detailed operator (when available), and M2M flag.
- `getOperatorByPrefix`, `get_operator_by_prefix`: map the two-digit prefix to the dominant carrier.
- `batchValidate`, `batch_validate`: process an iterable of numbers at once.
- `formatPhoneNumber`, `format_phone_number`: produce `standard`, `spaced`, or `international` strings.
- Browser helper adds `attachToInput`, `detachFromInput`, `validateViaApi`, `batchValidateAsync`, and CSV loading via `loadPrefixDatabaseFromUrl`.

## Testing

- JavaScript: `cd javascript && npm test`
- Python: `cd python && python test_polish_mobile_validator.py`
- Coverage artefacts (lcov, clover, JSON) are stored in `javascript/coverage` after running Jest; pytest can emit coverage with `pytest test_polish_mobile_validator.py -v --cov`.

## Continuous Integration

The GitHub Actions workflow at `.github/workflows/test.yml` runs JavaScript tests across Node.js 16, 18, and 20, Python tests across 3.8 through 3.12, validates the CSV assets, executes sample scripts, and collates coverage summaries.

## Project Layout

```text
Poland-Mobile-Operator-Prefixes/
├── Mobileprefix.csv
├── Mobileprefix_corrected.csv
├── README.md
├── javascript/
│   ├── polishMobileValidator.js
│   ├── polishMobileValidatorBrowser.js
│   ├── polishMobileValidator.test.js
│   ├── polishMobileValidatorBrowser.test.js
│   ├── demo.html
│   ├── examples.js
│   └── coverage/
└── python/
    ├── polish_mobile_validator.py
    ├── test_polish_mobile_validator.py
    └── examples.py
```

## Contributing

- Fork and create a feature branch (`git checkout -b feature/name`).
- Keep JavaScript and Python implementations aligned when adding features.
- Add or update tests alongside behaviour changes.
- Run both test suites before opening a pull request.

## License

Released under the MIT License. See the license section in this README or the repository header for full terms.

## Support

- Report bugs: <https://github.com/jomardyan/Poland-Mobile-Operator-Prefixes/issues>
- Start a discussion: <https://github.com/jomardyan/Poland-Mobile-Operator-Prefixes/discussions>
- Pull requests are welcome.

**Last updated:** 3 October 2025
