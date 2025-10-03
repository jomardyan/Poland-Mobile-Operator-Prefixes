/**
 * Polish Mobile Number Validator and Operator Recognition Framework
 * Based on Poland Mobile Operator Prefixes database
 * Updated: January 24, 2022
 */

const fs = require('fs');
const path = require('path');

class PolishMobileValidator {
    constructor(csvPath = null) {
        this.prefixDatabase = new Map();
        this.operatorPrefixes = {
            'Play': ['53', '60', '72', '73', '78', '79'],
            'Orange': ['50', '51', '57', '66', '69'],
            'T-Mobile': ['45', '88'],
            'Plus': ['21']
        };
        this.validPrefixes = ['21', '45', '50', '51', '53', '57', '60', '66', '69', '72', '73', '78', '79', '88'];
        
        if (csvPath) {
            this.loadPrefixDatabase(csvPath);
        }
    }

    /**
     * Load prefix database from CSV file
     * @param {string} csvPath - Path to the CSV file
     */
    loadPrefixDatabase(csvPath) {
        try {
            const data = fs.readFileSync(csvPath, 'utf-8');
            const lines = data.split('\n').slice(1); // Skip header
            
            lines.forEach(line => {
                if (line.trim()) {
                    const [prefix, operator] = line.split(';');
                    if (prefix && operator) {
                        // Remove +48 prefix and normalize
                        const normalizedPrefix = prefix.replace('+48', '').trim();
                        this.prefixDatabase.set(normalizedPrefix, operator.trim());
                    }
                }
            });
        } catch (error) {
            console.error(`Error loading CSV file: ${error.message}`);
        }
    }

    /**
     * Normalize phone number to standard format
     * @param {string} phoneNumber - Phone number to normalize
     * @returns {string} - Normalized phone number
     */
    normalizePhoneNumber(phoneNumber) {
        if (!phoneNumber) return '';
        
        // Remove all non-digit characters
        let normalized = phoneNumber.replace(/\D/g, '');
        
        // Remove country code if present
        if (normalized.startsWith('48') && normalized.length > 9) {
            normalized = normalized.substring(2);
        }
        
        return normalized;
    }

    /**
     * Validate if the phone number is a valid Polish mobile number
     * @param {string} phoneNumber - Phone number to validate
     * @returns {Object} - Validation result with status and message
     */
    validatePhoneNumber(phoneNumber) {
        const normalized = this.normalizePhoneNumber(phoneNumber);
        
        // Check if the number has 9 digits
        if (normalized.length !== 9) {
            return {
                valid: false,
                message: 'Polish mobile numbers must have exactly 9 digits',
                normalized: normalized
            };
        }
        
        // Check if the first two digits are valid
        const prefix = normalized.substring(0, 2);
        if (!this.validPrefixes.includes(prefix)) {
            return {
                valid: false,
                message: `Invalid prefix: ${prefix}. Valid prefixes are: ${this.validPrefixes.join(', ')}`,
                normalized: normalized,
                prefix: prefix
            };
        }
        
        return {
            valid: true,
            message: 'Valid Polish mobile number',
            normalized: normalized,
            prefix: prefix
        };
    }

    /**
     * Recognize the operator from phone number
     * @param {string} phoneNumber - Phone number to check
     * @returns {Object} - Operator information
     */
    recognizeOperator(phoneNumber) {
        const validation = this.validatePhoneNumber(phoneNumber);
        
        if (!validation.valid) {
            return {
                success: false,
                message: validation.message,
                phoneNumber: phoneNumber
            };
        }
        
        const normalized = validation.normalized;
        const prefix = validation.prefix;
        
        // Try to find exact match in database
        let detailedOperator = null;
        for (let i = normalized.length; i >= 2; i--) {
            const testPrefix = normalized.substring(0, i);
            if (this.prefixDatabase.has(testPrefix)) {
                detailedOperator = this.prefixDatabase.get(testPrefix);
                break;
            }
        }
        
        // Determine main operator from 2-digit prefix
        let mainOperator = 'Unknown';
        for (const [operator, prefixes] of Object.entries(this.operatorPrefixes)) {
            if (prefixes.includes(prefix)) {
                mainOperator = operator;
                break;
            }
        }
        
        // Check if it's M2M
        const isM2M = prefix === '21';
        
        return {
            success: true,
            phoneNumber: phoneNumber,
            normalized: normalized,
            prefix: prefix,
            operator: mainOperator,
            detailedOperator: detailedOperator,
            isM2M: isM2M,
            message: isM2M ? 'Machine to Machine (M2M) connection' : `Operator: ${mainOperator}`
        };
    }

    /**
     * Get operator by prefix
     * @param {string} prefix - Two-digit prefix
     * @returns {string} - Operator name
     */
    getOperatorByPrefix(prefix) {
        for (const [operator, prefixes] of Object.entries(this.operatorPrefixes)) {
            if (prefixes.includes(prefix)) {
                return operator;
            }
        }
        return 'Unknown';
    }

    /**
     * Check if prefix is for M2M connections
     * @param {string} phoneNumber - Phone number to check
     * @returns {boolean} - True if M2M
     */
    isM2MNumber(phoneNumber) {
        const normalized = this.normalizePhoneNumber(phoneNumber);
        return normalized.startsWith('21');
    }

    /**
     * Get all valid prefixes
     * @returns {Array} - Array of valid prefixes
     */
    getValidPrefixes() {
        return [...this.validPrefixes];
    }

    /**
     * Get all operators and their prefixes
     * @returns {Object} - Operators and their prefixes
     */
    getOperatorPrefixes() {
        return { ...this.operatorPrefixes };
    }

    /**
     * Batch validate multiple phone numbers
     * @param {Array} phoneNumbers - Array of phone numbers
     * @returns {Array} - Array of validation results
     */
    batchValidate(phoneNumbers) {
        return phoneNumbers.map(number => this.recognizeOperator(number));
    }

    /**
     * Format phone number for display
     * @param {string} phoneNumber - Phone number to format
     * @param {string} format - Format type ('standard', 'international', 'spaced')
     * @returns {string} - Formatted phone number
     */
    formatPhoneNumber(phoneNumber, format = 'standard') {
        const normalized = this.normalizePhoneNumber(phoneNumber);
        
        if (normalized.length !== 9) {
            return phoneNumber;
        }
        
        switch (format) {
            case 'international':
                return `+48 ${normalized.substring(0, 3)} ${normalized.substring(3, 6)} ${normalized.substring(6)}`;
            case 'spaced':
                return `${normalized.substring(0, 3)} ${normalized.substring(3, 6)} ${normalized.substring(6)}`;
            case 'standard':
            default:
                return normalized;
        }
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PolishMobileValidator;
}

// Export for browser
if (typeof window !== 'undefined') {
    window.PolishMobileValidator = PolishMobileValidator;
}
