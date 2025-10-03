/**
 * Polish Mobile Number Validator - Browser Extension
 * Real-time validation with Ajax and Event Listeners
 * Based on Poland Mobile Operator Prefixes database
 * Updated: October 3, 2025
 */

class PolishMobileValidatorBrowser {
    constructor(options = {}) {
        this.prefixDatabase = new Map();
        this.operatorPrefixes = {
            'Play': ['53', '79'],
            'Orange': ['50', '51', '57', '78'],
            'T-Mobile': ['45', '60', '66', '72', '73', '88'],
            'Plus': ['21', '69']
        };
        this.validPrefixes = [
            '21', '45', '50', '51', '53', '57', '60', '66', '69', '72', '73', '78', '79', '88'
        ];
        
        // Configuration options
        this.config = {
            debounceDelay: options.debounceDelay || 300,
            realTimeValidation: options.realTimeValidation !== false,
            showOperatorInfo: options.showOperatorInfo !== false,
            apiEndpoint: options.apiEndpoint || null,
            onValidation: options.onValidation || null,
            onError: options.onError || null
        };
        
        // Event listeners storage
        this.listeners = new Map();
        
        // Load CSV database if provided
        if (options.csvUrl) {
            this.loadPrefixDatabaseFromUrl(options.csvUrl);
        }
    }

    /**
     * Load prefix database from URL via Ajax
     * @param {string} url - URL to CSV file
     * @returns {Promise} - Promise that resolves when loaded
     */
    async loadPrefixDatabaseFromUrl(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();
            this.parseCsvData(data);
            return { success: true, message: 'Database loaded successfully' };
        } catch (error) {
            console.error('Error loading CSV database:', error);
            if (this.config.onError) {
                this.config.onError(error);
            }
            return { success: false, message: error.message };
        }
    }

    /**
     * Parse CSV data and populate database
     * @param {string} data - CSV data
     */
    parseCsvData(data) {
        const lines = data.split('\n').slice(1); // Skip header
        lines.forEach(line => {
            if (line.trim()) {
                const [prefix, operator] = line.split(';');
                if (prefix && operator) {
                    const normalizedPrefix = prefix.replace('+48', '').trim();
                    this.prefixDatabase.set(normalizedPrefix, operator.trim());
                }
            }
        });
    }

    /**
     * Normalize phone number to standard format
     * @param {string} phoneNumber - Phone number to normalize
     * @returns {string} - Normalized phone number
     */
    normalizePhoneNumber(phoneNumber) {
        if (!phoneNumber) return '';
        let normalized = phoneNumber.replace(/\D/g, '');
        if (normalized.startsWith('48') && normalized.length > 9) {
            normalized = normalized.substring(2);
        }
        return normalized;
    }

    /**
     * Validate phone number
     * @param {string} phoneNumber - Phone number to validate
     * @returns {Object} - Validation result
     */
    validatePhoneNumber(phoneNumber) {
        const normalized = this.normalizePhoneNumber(phoneNumber);
        
        if (normalized.length !== 9) {
            return {
                valid: false,
                message: 'Polish mobile numbers must have exactly 9 digits',
                normalized: normalized
            };
        }
        
        const prefix = normalized.substring(0, 2);
        if (!this.validPrefixes.includes(prefix)) {
            return {
                valid: false,
                message: `Invalid prefix: ${prefix}`,
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
     * Recognize operator from phone number
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
        
        let detailedOperator = null;
        for (let i = normalized.length; i >= 2; i--) {
            const testPrefix = normalized.substring(0, i);
            if (this.prefixDatabase.has(testPrefix)) {
                detailedOperator = this.prefixDatabase.get(testPrefix);
                break;
            }
        }
        
        let mainOperator = 'Unknown';
        for (const [operator, prefixes] of Object.entries(this.operatorPrefixes)) {
            if (prefixes.includes(prefix)) {
                mainOperator = operator;
                break;
            }
        }
        
        const isM2M = prefix === '21' || prefix === '69';
        
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
     * Attach real-time validation to input element
     * @param {HTMLElement|string} element - Input element or selector
     * @param {Object} options - Configuration options
     * @returns {Object} - Listener control object
     */
    attachToInput(element, options = {}) {
        const input = typeof element === 'string' ? document.querySelector(element) : element;
        
        if (!input) {
            console.error('Input element not found');
            return null;
        }
        
        const config = {
            showOperatorInfo: options.showOperatorInfo !== false,
            displayElement: options.displayElement || null,
            validClass: options.validClass || 'valid',
            invalidClass: options.invalidClass || 'invalid',
            onValidate: options.onValidate || null,
            formatOnBlur: options.formatOnBlur || false,
            format: options.format || 'spaced'
        };
        
        let debounceTimer;
        
        // Input event listener for real-time validation
        const inputHandler = (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.validateInput(input, config);
            }, this.config.debounceDelay);
        };
        
        // Blur event listener for formatting
        const blurHandler = (e) => {
            if (config.formatOnBlur) {
                const result = this.recognizeOperator(input.value);
                if (result.success) {
                    input.value = this.formatPhoneNumber(result.normalized, config.format);
                }
            }
            this.validateInput(input, config);
        };
        
        // Focus event listener
        const focusHandler = (e) => {
            const result = this.recognizeOperator(input.value);
            if (result.success && config.formatOnBlur) {
                input.value = result.normalized;
            }
        };
        
        input.addEventListener('input', inputHandler);
        input.addEventListener('blur', blurHandler);
        input.addEventListener('focus', focusHandler);
        
        // Store listeners for cleanup
        const listenerId = `listener_${Date.now()}_${Math.random()}`;
        this.listeners.set(listenerId, {
            element: input,
            handlers: { input: inputHandler, blur: blurHandler, focus: focusHandler }
        });
        
        return {
            id: listenerId,
            detach: () => this.detachFromInput(listenerId)
        };
    }

    /**
     * Validate input and update UI
     * @param {HTMLElement} input - Input element
     * @param {Object} config - Configuration
     */
    validateInput(input, config) {
        const result = this.recognizeOperator(input.value);
        
        // Update input classes
        input.classList.remove(config.validClass, config.invalidClass);
        if (input.value.trim()) {
            input.classList.add(result.success ? config.validClass : config.invalidClass);
        }
        
        // Update display element
        if (config.displayElement) {
            const display = typeof config.displayElement === 'string' 
                ? document.querySelector(config.displayElement) 
                : config.displayElement;
            
            if (display) {
                if (!input.value.trim()) {
                    display.textContent = '';
                    display.className = '';
                } else if (result.success && config.showOperatorInfo) {
                    display.textContent = `✓ ${result.operator}${result.isM2M ? ' (M2M)' : ''}`;
                    display.className = 'validation-success';
                } else if (!result.success) {
                    display.textContent = `✗ ${result.message}`;
                    display.className = 'validation-error';
                }
            }
        }
        
        // Call custom callback
        if (config.onValidate) {
            config.onValidate(result, input);
        }
        
        // Call global callback
        if (this.config.onValidation) {
            this.config.onValidation(result, input);
        }
    }

    /**
     * Detach event listeners from input
     * @param {string} listenerId - Listener ID
     */
    detachFromInput(listenerId) {
        const listener = this.listeners.get(listenerId);
        if (listener) {
            const { element, handlers } = listener;
            element.removeEventListener('input', handlers.input);
            element.removeEventListener('blur', handlers.blur);
            element.removeEventListener('focus', handlers.focus);
            this.listeners.delete(listenerId);
            return true;
        }
        return false;
    }

    /**
     * Validate via Ajax API endpoint
     * @param {string} phoneNumber - Phone number to validate
     * @returns {Promise} - Validation result
     */
    async validateViaApi(phoneNumber) {
        if (!this.config.apiEndpoint) {
            return this.recognizeOperator(phoneNumber);
        }
        
        try {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phoneNumber })
            });
            
            if (!response.ok) {
                throw new Error(`API error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API validation error:', error);
            if (this.config.onError) {
                this.config.onError(error);
            }
            // Fallback to local validation
            return this.recognizeOperator(phoneNumber);
        }
    }

    /**
     * Batch validate multiple numbers with Ajax
     * @param {Array} phoneNumbers - Array of phone numbers
     * @returns {Promise} - Array of validation results
     */
    async batchValidateAsync(phoneNumbers) {
        if (!this.config.apiEndpoint) {
            return phoneNumbers.map(num => this.recognizeOperator(num));
        }
        
        try {
            const response = await fetch(`${this.config.apiEndpoint}/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phoneNumbers })
            });
            
            if (!response.ok) {
                throw new Error(`API error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Batch validation error:', error);
            // Fallback to local validation
            return phoneNumbers.map(num => this.recognizeOperator(num));
        }
    }

    /**
     * Format phone number for display
     * @param {string} phoneNumber - Phone number to format
     * @param {string} format - Format type
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

    /**
     * Check if number is M2M
     * @param {string} phoneNumber - Phone number to check
     * @returns {boolean} - True if M2M
     */
    isM2MNumber(phoneNumber) {
        const normalized = this.normalizePhoneNumber(phoneNumber);
        const prefix = normalized.substring(0, 2);
        return prefix === '21' || prefix === '69';
    }

    /**
     * Get all valid prefixes
     * @returns {Array} - Array of valid prefixes
     */
    getValidPrefixes() {
        return [...this.validPrefixes];
    }

    /**
     * Get operator prefixes
     * @returns {Object} - Operator prefixes
     */
    getOperatorPrefixes() {
        return { ...this.operatorPrefixes };
    }

    /**
     * Cleanup all listeners
     */
    destroy() {
        this.listeners.forEach((listener, id) => {
            this.detachFromInput(id);
        });
        this.listeners.clear();
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.PolishMobileValidatorBrowser = PolishMobileValidatorBrowser;
}

// Export for Node.js (for testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PolishMobileValidatorBrowser;
}
