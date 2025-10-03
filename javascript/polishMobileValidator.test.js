/**
 * Unit Tests for Polish Mobile Validator
 */

const PolishMobileValidator = require('./polishMobileValidator');
const path = require('path');

describe('PolishMobileValidator', () => {
    let validator;
    let validatorWithCSV;

    beforeEach(() => {
        validator = new PolishMobileValidator();
        const csvPath = path.join(__dirname, '..', 'Mobileprefix_corrected.csv');
        validatorWithCSV = new PolishMobileValidator(csvPath);
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

        test('should handle null', () => {
            expect(validator.normalizePhoneNumber(null)).toBe('');
        });
    });

    describe('Phone Number Validation', () => {
        test('should validate correct Orange number', () => {
            const result = validator.validatePhoneNumber('501234567');
            expect(result.valid).toBe(true);
            expect(result.prefix).toBe('50');
        });

        test('should validate correct Play number', () => {
            const result = validator.validatePhoneNumber('601234567');
            expect(result.valid).toBe(true);
            expect(result.prefix).toBe('60');
        });

        test('should validate correct T-Mobile number', () => {
            const result = validator.validatePhoneNumber('881234567');
            expect(result.valid).toBe(true);
            expect(result.prefix).toBe('88');
        });

        test('should validate correct Plus/M2M number', () => {
            const result = validator.validatePhoneNumber('211234567');
            expect(result.valid).toBe(true);
            expect(result.prefix).toBe('21');
        });

        test('should reject number with wrong length', () => {
            const result = validator.validatePhoneNumber('50123456');
            expect(result.valid).toBe(false);
            expect(result.message).toContain('9 digits');
        });

        test('should reject number with invalid prefix', () => {
            const result = validator.validatePhoneNumber('991234567');
            expect(result.valid).toBe(false);
            expect(result.message).toContain('Invalid prefix');
        });

        test('should validate number with country code', () => {
            const result = validator.validatePhoneNumber('+48501234567');
            expect(result.valid).toBe(true);
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

        test('should recognize Plus operator', () => {
            const result = validator.recognizeOperator('211234567');
            expect(result.success).toBe(true);
            expect(result.operator).toBe('Plus');
            expect(result.isM2M).toBe(true);
        });

        test('should handle invalid number', () => {
            const result = validator.recognizeOperator('991234567');
            expect(result.success).toBe(false);
        });

        test('should provide detailed operator info when CSV loaded', () => {
            const result = validatorWithCSV.recognizeOperator('500123456');
            expect(result.success).toBe(true);
            expect(result.operator).toBe('Orange');
        });
    });

    describe('M2M Detection', () => {
        test('should detect M2M number', () => {
            expect(validator.isM2MNumber('211234567')).toBe(true);
            expect(validator.isM2MNumber('691234567')).toBe(true);
        });

        test('should not detect non-M2M number', () => {
            expect(validator.isM2MNumber('501234567')).toBe(false);
        });

        test('should handle M2M with country code', () => {
            expect(validator.isM2MNumber('+48211234567')).toBe(true);
        });
    });

    describe('Prefix Operations', () => {
        test('should get operator by prefix', () => {
            expect(validator.getOperatorByPrefix('50')).toBe('Orange');
            expect(validator.getOperatorByPrefix('53')).toBe('Play');
            expect(validator.getOperatorByPrefix('60')).toBe('T-Mobile');
            expect(validator.getOperatorByPrefix('21')).toBe('Plus');
            expect(validator.getOperatorByPrefix('69')).toBe('Plus');
        });

        test('should return Unknown for invalid prefix', () => {
            expect(validator.getOperatorByPrefix('99')).toBe('Unknown');
        });

        test('should get all valid prefixes', () => {
            const prefixes = validator.getValidPrefixes();
            expect(prefixes).toContain('50');
            expect(prefixes).toContain('88');
            expect(prefixes.length).toBe(14);
        });

        test('should get operator prefixes mapping', () => {
            const mapping = validator.getOperatorPrefixes();
            expect(mapping['Orange']).toContain('57');
            expect(mapping['Play']).toContain('53');
            expect(mapping['T-Mobile']).toContain('60');
            expect(mapping['Plus']).toContain('69');
        });
    });

    describe('Batch Validation', () => {
        test('should validate multiple numbers', () => {
            const numbers = ['501234567', '531234567', '881234567'];
            const results = validator.batchValidate(numbers);
            
            expect(results.length).toBe(3);
            expect(results[0].success).toBe(true);
            expect(results[1].success).toBe(true);
            expect(results[2].success).toBe(true);
        });

        test('should handle mixed valid and invalid numbers', () => {
            const numbers = ['501234567', '991234567', '881234567'];
            const results = validator.batchValidate(numbers);
            
            expect(results.length).toBe(3);
            expect(results[0].success).toBe(true);
            expect(results[1].success).toBe(false);
            expect(results[2].success).toBe(true);
        });
    });

    describe('Phone Number Formatting', () => {
        test('should format as standard', () => {
            const formatted = validator.formatPhoneNumber('501234567', 'standard');
            expect(formatted).toBe('501234567');
        });

        test('should format as international', () => {
            const formatted = validator.formatPhoneNumber('501234567', 'international');
            expect(formatted).toBe('+48 501 234 567');
        });

        test('should format as spaced', () => {
            const formatted = validator.formatPhoneNumber('501234567', 'spaced');
            expect(formatted).toBe('501 234 567');
        });

        test('should not format invalid length numbers', () => {
            const formatted = validator.formatPhoneNumber('50123456', 'international');
            expect(formatted).toBe('50123456');
        });

        test('should format number with country code', () => {
            const formatted = validator.formatPhoneNumber('+48501234567', 'international');
            expect(formatted).toBe('+48 501 234 567');
        });
    });

    describe('Edge Cases', () => {
        test('should handle various Orange prefixes', () => {
            ['50', '51', '57', '78'].forEach(prefix => {
                const result = validator.recognizeOperator(`${prefix}1234567`);
                expect(result.success).toBe(true);
                expect(result.operator).toBe('Orange');
            });
        });

        test('should handle all Play prefixes', () => {
            ['53', '79'].forEach(prefix => {
                const result = validator.recognizeOperator(`${prefix}1234567`);
                expect(result.success).toBe(true);
                expect(result.operator).toBe('Play');
            });
        });

        test('should handle phone number with parentheses', () => {
            const result = validator.validatePhoneNumber('(501) 234-567');
            expect(result.valid).toBe(true);
        });
    });

    describe('CSV Database Loading', () => {
        test('should load CSV database', () => {
            expect(validatorWithCSV.prefixDatabase.size).toBeGreaterThan(0);
        });

        test('should provide detailed operator from database', () => {
            const result = validatorWithCSV.recognizeOperator('500123456');
            if (result.detailedOperator) {
                expect(result.detailedOperator).toBeTruthy();
            }
        });
    });
});
