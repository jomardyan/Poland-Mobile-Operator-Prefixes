/**
 * Unit Tests for Polish Mobile Validator Browser Extension
 */

const PolishMobileValidatorBrowser = require('./polishMobileValidatorBrowser');

describe('PolishMobileValidatorBrowser', () => {
    let validator;

    beforeEach(() => {
        validator = new PolishMobileValidatorBrowser({
            debounceDelay: 100,
            realTimeValidation: true
        });
    });

    afterEach(() => {
        if (validator) {
            validator.destroy();
        }
    });

    describe('Constructor and Configuration', () => {
        test('should initialize with default options', () => {
            expect(validator.config.debounceDelay).toBe(100);
            expect(validator.config.realTimeValidation).toBe(true);
            expect(validator.config.showOperatorInfo).toBe(true);
        });

        test('should initialize with custom options', () => {
            const customValidator = new PolishMobileValidatorBrowser({
                debounceDelay: 500,
                realTimeValidation: false,
                showOperatorInfo: false
            });
            expect(customValidator.config.debounceDelay).toBe(500);
            expect(customValidator.config.realTimeValidation).toBe(false);
            expect(customValidator.config.showOperatorInfo).toBe(false);
        });
    });

    describe('Phone Number Normalization', () => {
        test('should normalize phone number with country code', () => {
            expect(validator.normalizePhoneNumber('+48501234567')).toBe('501234567');
        });

        test('should normalize phone number without country code', () => {
            expect(validator.normalizePhoneNumber('501234567')).toBe('501234567');
        });

        test('should normalize phone number with spaces', () => {
            expect(validator.normalizePhoneNumber('501 234 567')).toBe('501234567');
        });

        test('should normalize phone number with dashes', () => {
            expect(validator.normalizePhoneNumber('501-234-567')).toBe('501234567');
        });

        test('should handle empty string', () => {
            expect(validator.normalizePhoneNumber('')).toBe('');
        });
    });

    describe('Phone Number Validation', () => {
        test('should validate correct Orange number', () => {
            const result = validator.validatePhoneNumber('501234567');
            expect(result.valid).toBe(true);
            expect(result.prefix).toBe('50');
        });

        test('should validate correct Play number', () => {
            const result = validator.validatePhoneNumber('531234567');
            expect(result.valid).toBe(true);
            expect(result.prefix).toBe('53');
        });

        test('should validate correct T-Mobile number', () => {
            const result = validator.validatePhoneNumber('601234567');
            expect(result.valid).toBe(true);
            expect(result.prefix).toBe('60');
        });

        test('should reject invalid prefix', () => {
            const result = validator.validatePhoneNumber('991234567');
            expect(result.valid).toBe(false);
            expect(result.message).toContain('Invalid prefix');
        });

        test('should reject invalid length', () => {
            const result = validator.validatePhoneNumber('50123456');
            expect(result.valid).toBe(false);
            expect(result.message).toContain('9 digits');
        });
    });

    describe('Operator Recognition', () => {
        test('should recognize Orange operator', () => {
            const result = validator.recognizeOperator('501234567');
            expect(result.success).toBe(true);
            expect(result.operator).toBe('Orange');
            expect(result.isM2M).toBe(false);
        });

        test('should recognize Play operator', () => {
            const result = validator.recognizeOperator('531234567');
            expect(result.success).toBe(true);
            expect(result.operator).toBe('Play');
        });

        test('should recognize T-Mobile operator', () => {
            const result = validator.recognizeOperator('601234567');
            expect(result.success).toBe(true);
            expect(result.operator).toBe('T-Mobile');
        });

        test('should recognize Plus operator and M2M', () => {
            const result = validator.recognizeOperator('211234567');
            expect(result.success).toBe(true);
            expect(result.operator).toBe('Plus');
            expect(result.isM2M).toBe(true);
        });

        test('should handle invalid number', () => {
            const result = validator.recognizeOperator('991234567');
            expect(result.success).toBe(false);
        });
    });

    describe('M2M Detection', () => {
        test('should detect M2M for prefix 21', () => {
            expect(validator.isM2MNumber('211234567')).toBe(true);
        });

        test('should detect M2M for prefix 69', () => {
            expect(validator.isM2MNumber('691234567')).toBe(true);
        });

        test('should not detect M2M for regular number', () => {
            expect(validator.isM2MNumber('501234567')).toBe(false);
        });
    });

    describe('Phone Number Formatting', () => {
        const number = '501234567';

        test('should format in standard format', () => {
            expect(validator.formatPhoneNumber(number, 'standard')).toBe('501234567');
        });

        test('should format in international format', () => {
            expect(validator.formatPhoneNumber(number, 'international')).toBe('+48 501 234 567');
        });

        test('should format in spaced format', () => {
            expect(validator.formatPhoneNumber(number, 'spaced')).toBe('501 234 567');
        });

        test('should return original for invalid number', () => {
            expect(validator.formatPhoneNumber('123', 'international')).toBe('123');
        });
    });

    describe('Prefix Operations', () => {
        test('should return all valid prefixes', () => {
            const prefixes = validator.getValidPrefixes();
            expect(Array.isArray(prefixes)).toBe(true);
            expect(prefixes).toContain('50');
            expect(prefixes).toContain('53');
            expect(prefixes).toContain('21');
        });

        test('should return operator prefixes', () => {
            const operatorPrefixes = validator.getOperatorPrefixes();
            expect(operatorPrefixes.Orange).toContain('50');
            expect(operatorPrefixes.Play).toContain('53');
            expect(operatorPrefixes['T-Mobile']).toContain('60');
            expect(operatorPrefixes.Plus).toContain('21');
        });
    });

    describe('CSV Data Parsing', () => {
        test('should parse CSV data correctly', () => {
            const csvData = `Prefix;Operator
+48500;Orange Polska S.A.
+48530;P4 Sp. z o.o. (Play)`;
            
            validator.parseCsvData(csvData);
            expect(validator.prefixDatabase.has('500')).toBe(true);
            expect(validator.prefixDatabase.has('530')).toBe(true);
        });

        test('should handle empty CSV data', () => {
            const csvData = '';
            validator.parseCsvData(csvData);
            expect(validator.prefixDatabase.size).toBe(0);
        });
    });

    describe('Event Listener Management', () => {
        test('should track attached listeners', () => {
            const mockElement = {
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                classList: {
                    add: jest.fn(),
                    remove: jest.fn()
                }
            };

            const listener = validator.attachToInput(mockElement);
            expect(listener).toBeTruthy();
            expect(listener.id).toBeTruthy();
            expect(mockElement.addEventListener).toHaveBeenCalledTimes(3);
        });

        test('should detach listeners', () => {
            const mockElement = {
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                classList: {
                    add: jest.fn(),
                    remove: jest.fn()
                }
            };

            const listener = validator.attachToInput(mockElement);
            const detached = validator.detachFromInput(listener.id);
            
            expect(detached).toBe(true);
            expect(mockElement.removeEventListener).toHaveBeenCalledTimes(3);
        });

        test('should cleanup all listeners on destroy', () => {
            const mockElement1 = {
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                classList: { add: jest.fn(), remove: jest.fn() }
            };
            
            const mockElement2 = {
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                classList: { add: jest.fn(), remove: jest.fn() }
            };

            validator.attachToInput(mockElement1);
            validator.attachToInput(mockElement2);
            
            validator.destroy();
            
            expect(validator.listeners.size).toBe(0);
            expect(mockElement1.removeEventListener).toHaveBeenCalledTimes(3);
            expect(mockElement2.removeEventListener).toHaveBeenCalledTimes(3);
        });
    });

    describe('Async Operations', () => {
        test('should validate via API with fallback', async () => {
            const result = await validator.validateViaApi('501234567');
            expect(result.success).toBe(true);
            expect(result.operator).toBe('Orange');
        });

        test('should batch validate async with fallback', async () => {
            const numbers = ['501234567', '531234567', '991234567'];
            const results = await validator.batchValidateAsync(numbers);
            
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBe(3);
            expect(results[0].success).toBe(true);
            expect(results[1].success).toBe(true);
            expect(results[2].success).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        test('should handle null input element', () => {
            const result = validator.attachToInput(null);
            expect(result).toBeNull();
        });

        test('should handle detaching non-existent listener', () => {
            const result = validator.detachFromInput('non-existent-id');
            expect(result).toBe(false);
        });

        test('should handle empty phone number', () => {
            const result = validator.recognizeOperator('');
            expect(result.success).toBe(false);
        });

        test('should handle special characters', () => {
            const result = validator.recognizeOperator('(501) 234-567');
            expect(result.success).toBe(true);
            expect(result.normalized).toBe('501234567');
        });
    });
});
