/**
 * Example Usage of Polish Mobile Validator (JavaScript)
 * This file demonstrates the main features of the validator
 */

const PolishMobileValidator = require('./polishMobileValidator');
const path = require('path');

console.log('='.repeat(70));
console.log('Polish Mobile Number Validator - JavaScript Examples');
console.log('='.repeat(70));
console.log();

// Initialize validator
const validator = new PolishMobileValidator();

// Load CSV database for detailed information
const csvPath = path.join(__dirname, '..', 'Mobileprefix.csv');
const validatorWithDB = new PolishMobileValidator(csvPath);

// Test phone numbers
const testNumbers = [
    { number: '501234567', description: 'Orange number' },
    { number: '+48721234567', description: 'Play number with country code' },
    { number: '881234567', description: 'T-Mobile number' },
    { number: '211234567', description: 'Plus/M2M number' },
    { number: '991234567', description: 'Invalid prefix' },
    { number: '50123456', description: 'Invalid length' },
    { number: '(501) 234-567', description: 'Number with formatting' }
];

// Example 1: Validate and Recognize Operators
console.log('EXAMPLE 1: Operator Recognition');
console.log('-'.repeat(70));
testNumbers.forEach(test => {
    const result = validator.recognizeOperator(test.number);
    console.log(`\nInput: ${test.number} (${test.description})`);
    console.log(`Status: ${result.success ? '✓ Valid' : '✗ Invalid'}`);
    
    if (result.success) {
        console.log(`  - Normalized: ${result.normalized}`);
        console.log(`  - Prefix: ${result.prefix}`);
        console.log(`  - Operator: ${result.operator}`);
        console.log(`  - M2M: ${result.isM2M ? 'Yes' : 'No'}`);
    } else {
        console.log(`  - Error: ${result.message}`);
    }
});

// Example 2: Phone Number Formatting
console.log('\n\n' + '='.repeat(70));
console.log('EXAMPLE 2: Phone Number Formatting');
console.log('-'.repeat(70));
const formatNumber = '501234567';
console.log(`\nOriginal: ${formatNumber}`);
console.log(`Standard:      ${validator.formatPhoneNumber(formatNumber, 'standard')}`);
console.log(`International: ${validator.formatPhoneNumber(formatNumber, 'international')}`);
console.log(`Spaced:        ${validator.formatPhoneNumber(formatNumber, 'spaced')}`);

// Example 3: Batch Validation
console.log('\n\n' + '='.repeat(70));
console.log('EXAMPLE 3: Batch Validation');
console.log('-'.repeat(70));
const batchNumbers = ['501234567', '721234567', '881234567', '211234567'];
console.log('\nValidating multiple numbers at once...');
const results = validator.batchValidate(batchNumbers);

results.forEach(result => {
    const icon = result.success ? '✓' : '✗';
    const operator = result.success ? result.operator : 'Invalid';
    console.log(`  ${icon} ${result.phoneNumber.padEnd(15)} → ${operator}`);
});

// Example 4: M2M Detection
console.log('\n\n' + '='.repeat(70));
console.log('EXAMPLE 4: M2M Detection');
console.log('-'.repeat(70));
const m2mTest = ['211234567', '501234567', '721234567'];
console.log('\nChecking for Machine-to-Machine numbers...');
m2mTest.forEach(number => {
    const isM2M = validator.isM2MNumber(number);
    const result = validator.recognizeOperator(number);
    console.log(`  ${number}: ${isM2M ? '✓ M2M' : '✗ Regular'} (${result.operator})`);
});

// Example 5: Operator Information
console.log('\n\n' + '='.repeat(70));
console.log('EXAMPLE 5: Operator and Prefix Information');
console.log('-'.repeat(70));
console.log('\nValid prefixes:', validator.getValidPrefixes().join(', '));
console.log('\nOperator prefixes:');
const operatorPrefixes = validator.getOperatorPrefixes();
Object.entries(operatorPrefixes).forEach(([operator, prefixes]) => {
    console.log(`  ${operator.padEnd(10)}: ${prefixes.join(', ')}`);
});

// Example 6: Database-Enhanced Recognition
console.log('\n\n' + '='.repeat(70));
console.log('EXAMPLE 6: Detailed Operator Recognition (with CSV database)');
console.log('-'.repeat(70));
const detailedTest = ['500123456', '572123456', '660123456'];
console.log('\nRecognizing with detailed database information...');
detailedTest.forEach(number => {
    const result = validatorWithDB.recognizeOperator(number);
    if (result.success) {
        console.log(`\n  ${number}:`);
        console.log(`    Main Operator: ${result.operator}`);
        if (result.detailedOperator) {
            console.log(`    Detailed Info: ${result.detailedOperator}`);
        }
    }
});

console.log('\n' + '='.repeat(70));
console.log('Examples completed!');
console.log('='.repeat(70));
