"""
Unit Tests for Polish Mobile Validator
"""

import unittest
import os
import sys
from polish_mobile_validator import PolishMobileValidator


class TestPolishMobileValidator(unittest.TestCase):
    """Test cases for PolishMobileValidator class"""

    def setUp(self):
        """Set up test fixtures"""
        self.validator = PolishMobileValidator()
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'Mobileprefix_corrected.csv')
        if os.path.exists(csv_path):
            self.validator_with_csv = PolishMobileValidator(csv_path)
        else:
            self.validator_with_csv = self.validator

    def test_normalize_phone_number_with_country_code(self):
        """Test normalization with country code"""
        result = self.validator.normalize_phone_number('+48501234567')
        self.assertEqual(result, '501234567')

    def test_normalize_phone_number_without_country_code(self):
        """Test normalization without country code"""
        result = self.validator.normalize_phone_number('501234567')
        self.assertEqual(result, '501234567')

    def test_normalize_phone_number_with_spaces(self):
        """Test normalization with spaces"""
        result = self.validator.normalize_phone_number('501 234 567')
        self.assertEqual(result, '501234567')

    def test_normalize_phone_number_with_dashes(self):
        """Test normalization with dashes"""
        result = self.validator.normalize_phone_number('501-234-567')
        self.assertEqual(result, '501234567')

    def test_normalize_phone_number_empty_string(self):
        """Test normalization with empty string"""
        result = self.validator.normalize_phone_number('')
        self.assertEqual(result, '')

    def test_normalize_phone_number_none(self):
        """Test normalization with None"""
        result = self.validator.normalize_phone_number(None)
        self.assertEqual(result, '')

    def test_validate_correct_orange_number(self):
        """Test validation of correct Orange number"""
        result = self.validator.validate_phone_number('501234567')
        self.assertTrue(result['valid'])
        self.assertEqual(result['prefix'], '50')

    def test_validate_correct_play_number(self):
        """Test validation of correct Play number"""
        result = self.validator.validate_phone_number('601234567')
        self.assertTrue(result['valid'])
        self.assertEqual(result['prefix'], '60')

    def test_validate_correct_tmobile_number(self):
        """Test validation of correct T-Mobile number"""
        result = self.validator.validate_phone_number('881234567')
        self.assertTrue(result['valid'])
        self.assertEqual(result['prefix'], '88')

    def test_validate_correct_plus_m2m_number(self):
        """Test validation of correct Plus/M2M number"""
        result = self.validator.validate_phone_number('211234567')
        self.assertTrue(result['valid'])
        self.assertEqual(result['prefix'], '21')

    def test_validate_wrong_length(self):
        """Test validation with wrong length"""
        result = self.validator.validate_phone_number('50123456')
        self.assertFalse(result['valid'])
        self.assertIn('9 digits', result['message'])

    def test_validate_invalid_prefix(self):
        """Test validation with invalid prefix"""
        result = self.validator.validate_phone_number('991234567')
        self.assertFalse(result['valid'])
        self.assertIn('Invalid prefix', result['message'])

    def test_validate_with_country_code(self):
        """Test validation with country code"""
        result = self.validator.validate_phone_number('+48501234567')
        self.assertTrue(result['valid'])

    def test_recognize_orange_operator(self):
        """Test recognition of Orange operator"""
        result = self.validator.recognize_operator('501234567')
        self.assertTrue(result['success'])
        self.assertEqual(result['operator'], 'Orange')
        self.assertFalse(result['is_m2m'])

    def test_recognize_play_operator(self):
        """Test recognition of Play operator"""
        result = self.validator.recognize_operator('531234567')
        self.assertTrue(result['success'])
        self.assertEqual(result['operator'], 'Play')

    def test_recognize_tmobile_operator(self):
        """Test recognition of T-Mobile operator"""
        result = self.validator.recognize_operator('601234567')
        self.assertTrue(result['success'])
        self.assertEqual(result['operator'], 'T-Mobile')

    def test_recognize_plus_operator(self):
        """Test recognition of Plus operator"""
        result = self.validator.recognize_operator('211234567')
        self.assertTrue(result['success'])
        self.assertEqual(result['operator'], 'Plus')
        self.assertTrue(result['is_m2m'])

    def test_recognize_invalid_number(self):
        """Test recognition with invalid number"""
        result = self.validator.recognize_operator('991234567')
        self.assertFalse(result['success'])

    def test_is_m2m_number_true(self):
        """Test M2M detection for M2M number"""
        result = self.validator.is_m2m_number('211234567')
        self.assertTrue(result)
        result = self.validator.is_m2m_number('691234567')
        self.assertTrue(result)

    def test_is_m2m_number_false(self):
        """Test M2M detection for non-M2M number"""
        result = self.validator.is_m2m_number('501234567')
        self.assertFalse(result)

    def test_is_m2m_with_country_code(self):
        """Test M2M detection with country code"""
        result = self.validator.is_m2m_number('+48211234567')
        self.assertTrue(result)

    def test_get_operator_by_prefix_orange(self):
        """Test get operator by Orange prefix"""
        self.assertEqual(self.validator.get_operator_by_prefix('50'), 'Orange')

    def test_get_operator_by_prefix_play(self):
        """Test get operator by Play prefix"""
        self.assertEqual(self.validator.get_operator_by_prefix('53'), 'Play')

    def test_get_operator_by_prefix_tmobile(self):
        """Test get operator by T-Mobile prefix"""
        self.assertEqual(self.validator.get_operator_by_prefix('60'), 'T-Mobile')

    def test_get_operator_by_prefix_plus(self):
        """Test get operator by Plus prefix"""
        self.assertEqual(self.validator.get_operator_by_prefix('21'), 'Plus')

    def test_get_operator_by_invalid_prefix(self):
        """Test get operator by invalid prefix"""
        self.assertEqual(self.validator.get_operator_by_prefix('99'), 'Unknown')

    def test_get_valid_prefixes(self):
        """Test getting all valid prefixes"""
        prefixes = self.validator.get_valid_prefixes()
        self.assertIn('50', prefixes)
        self.assertIn('88', prefixes)
        self.assertEqual(len(prefixes), 14)

    def test_get_operator_prefixes(self):
        """Test getting operator prefixes mapping"""
        mapping = self.validator.get_operator_prefixes()
        self.assertIn('57', mapping['Orange'])
        self.assertIn('53', mapping['Play'])
        self.assertIn('60', mapping['T-Mobile'])
        self.assertIn('69', mapping['Plus'])

    def test_batch_validate_multiple_numbers(self):
        """Test batch validation with multiple valid numbers"""
        numbers = ['501234567', '531234567', '881234567']
        results = self.validator.batch_validate(numbers)
        
        self.assertEqual(len(results), 3)
        self.assertTrue(results[0]['success'])
        self.assertTrue(results[1]['success'])
        self.assertTrue(results[2]['success'])

    def test_batch_validate_mixed_numbers(self):
        """Test batch validation with mixed valid and invalid numbers"""
        numbers = ['501234567', '991234567', '881234567']
        results = self.validator.batch_validate(numbers)
        
        self.assertEqual(len(results), 3)
        self.assertTrue(results[0]['success'])
        self.assertFalse(results[1]['success'])
        self.assertTrue(results[2]['success'])

    def test_format_phone_number_standard(self):
        """Test phone number formatting as standard"""
        formatted = self.validator.format_phone_number('501234567', 'standard')
        self.assertEqual(formatted, '501234567')

    def test_format_phone_number_international(self):
        """Test phone number formatting as international"""
        formatted = self.validator.format_phone_number('501234567', 'international')
        self.assertEqual(formatted, '+48 501 234 567')

    def test_format_phone_number_spaced(self):
        """Test phone number formatting as spaced"""
        formatted = self.validator.format_phone_number('501234567', 'spaced')
        self.assertEqual(formatted, '501 234 567')

    def test_format_phone_number_invalid_length(self):
        """Test formatting with invalid length"""
        formatted = self.validator.format_phone_number('50123456', 'international')
        self.assertEqual(formatted, '50123456')

    def test_format_phone_number_with_country_code(self):
        """Test formatting number with country code"""
        formatted = self.validator.format_phone_number('+48501234567', 'international')
        self.assertEqual(formatted, '+48 501 234 567')

    def test_all_play_prefixes(self):
        """Test all Play prefixes"""
        play_prefixes = ['53', '79']
        for prefix in play_prefixes:
            result = self.validator.recognize_operator(f'{prefix}1234567')
            self.assertTrue(result['success'])
            self.assertEqual(result['operator'], 'Play')

    def test_phone_number_with_parentheses(self):
        """Test phone number with parentheses"""
        result = self.validator.validate_phone_number('(501) 234-567')
        self.assertTrue(result['valid'])

    def test_all_orange_prefixes(self):
        """Test Orange prefixes"""
        orange_prefixes = ['50', '51', '57', '78']
        for prefix in orange_prefixes:
            result = self.validator.recognize_operator(f'{prefix}1234567')
            self.assertTrue(result['success'])
            self.assertEqual(result['operator'], 'Orange')

    def test_all_tmobile_prefixes(self):
        """Test T-Mobile prefixes"""
        tmobile_prefixes = ['45', '60', '66', '72', '73', '88']
        for prefix in tmobile_prefixes:
            result = self.validator.recognize_operator(f'{prefix}1234567')
            self.assertTrue(result['success'])
            self.assertEqual(result['operator'], 'T-Mobile')

    def test_csv_database_loading(self):
        """Test CSV database loading"""
        if self.validator_with_csv != self.validator:
            self.assertGreater(len(self.validator_with_csv.prefix_database), 0)

    def test_recognize_with_csv_database(self):
        """Test operator recognition with CSV database"""
        result = self.validator_with_csv.recognize_operator('500123456')
        self.assertTrue(result['success'])
        self.assertEqual(result['operator'], 'Orange')


class TestEdgeCases(unittest.TestCase):
    """Test edge cases and special scenarios"""

    def setUp(self):
        """Set up test fixtures"""
        self.validator = PolishMobileValidator()

    def test_very_long_number(self):
        """Test with very long number"""
        result = self.validator.validate_phone_number('48501234567890')
        self.assertFalse(result['valid'])

    def test_number_with_letters(self):
        """Test with letters in number"""
        result = self.validator.normalize_phone_number('501ABC567')
        self.assertEqual(result, '501567')

    def test_special_characters(self):
        """Test with special characters"""
        result = self.validator.normalize_phone_number('+48 (501) 234-567')
        self.assertEqual(result, '501234567')

    def test_empty_batch_validate(self):
        """Test batch validate with empty list"""
        results = self.validator.batch_validate([])
        self.assertEqual(len(results), 0)

    def test_single_digit_prefix(self):
        """Test with single digit prefix"""
        result = self.validator.validate_phone_number('51234567')
        self.assertFalse(result['valid'])


if __name__ == '__main__':
    # Run tests with verbose output
    unittest.main(verbosity=2)
