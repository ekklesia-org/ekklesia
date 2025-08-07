/**
 * Church Validation Utilities
 * 
 * Contains business rule validation functions for church operations
 */

import { 
  ChurchValidationError, 
  ChurchBusinessRuleError,
  ChurchSettingsValidationError 
} from '../errors/church.errors';
import { CreateChurchDto, UpdateChurchDto, ChurchSettingsDto } from '../services/churches.service';

/**
 * Validate church data against business rules
 */
export class ChurchValidator {
  
  /**
   * Validate church creation data
   */
  static validateCreateChurch(data: CreateChurchDto): void {
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Church name is required';
    } else if (data.name.length < 2) {
      errors.name = 'Church name must be at least 2 characters long';
    } else if (data.name.length > 100) {
      errors.name = 'Church name must not exceed 100 characters';
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.email = 'Church email is required';
    } else if (!this.isValidEmail(data.email)) {
      errors.email = 'Invalid email format';
    }

    // Optional fields validation
    if (data.slug && !this.isValidSlug(data.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    if (data.phone && !this.isValidPhoneNumber(data.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    if (data.website && !this.isValidURL(data.website)) {
      errors.website = 'Invalid website URL format';
    }

    if (data.logoUrl && !this.isValidURL(data.logoUrl)) {
      errors.logoUrl = 'Invalid logo URL format';
    }

    if (data.taxId && !this.isValidTaxId(data.taxId)) {
      errors.taxId = 'Invalid tax ID format';
    }

    if (data.zipCode && !this.isValidZipCode(data.zipCode)) {
      errors.zipCode = 'Invalid ZIP code format';
    }

    if (Object.keys(errors).length > 0) {
      throw new ChurchValidationError('data', 'Invalid church data', errors);
    }
  }

  /**
   * Validate church update data
   */
  static validateUpdateChurch(data: UpdateChurchDto): void {
    const errors: Record<string, string> = {};

    // Only validate provided fields
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.name = 'Church name cannot be empty';
      } else if (data.name.length < 2) {
        errors.name = 'Church name must be at least 2 characters long';
      } else if (data.name.length > 100) {
        errors.name = 'Church name must not exceed 100 characters';
      }
    }

    if (data.email !== undefined) {
      if (!data.email || data.email.trim().length === 0) {
        errors.email = 'Church email cannot be empty';
      } else if (!this.isValidEmail(data.email)) {
        errors.email = 'Invalid email format';
      }
    }

    if (data.slug !== undefined && data.slug && !this.isValidSlug(data.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    if (data.phone !== undefined && data.phone && !this.isValidPhoneNumber(data.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    if (data.website !== undefined && data.website && !this.isValidURL(data.website)) {
      errors.website = 'Invalid website URL format';
    }

    if (data.logoUrl !== undefined && data.logoUrl && !this.isValidURL(data.logoUrl)) {
      errors.logoUrl = 'Invalid logo URL format';
    }

    if (data.taxId !== undefined && data.taxId && !this.isValidTaxId(data.taxId)) {
      errors.taxId = 'Invalid tax ID format';
    }

    if (data.zipCode !== undefined && data.zipCode && !this.isValidZipCode(data.zipCode)) {
      errors.zipCode = 'Invalid ZIP code format';
    }

    if (Object.keys(errors).length > 0) {
      throw new ChurchValidationError('data', 'Invalid church update data', errors);
    }
  }

  /**
   * Validate church settings data
   */
  static validateChurchSettings(data: ChurchSettingsDto): void {
    const errors: Record<string, string> = {};

    if (data.timezone && !this.isValidTimezone(data.timezone)) {
      errors.timezone = 'Invalid timezone format';
    }

    if (data.currency && !this.isValidCurrency(data.currency)) {
      errors.currency = 'Invalid currency code';
    }

    if (data.fiscalYear && !this.isValidFiscalYear(data.fiscalYear)) {
      errors.fiscalYear = 'Invalid fiscal year format (must be "calendar" or "april-march")';
    }

    if (data.enabledModules && !Array.isArray(data.enabledModules)) {
      errors.enabledModules = 'Enabled modules must be an array';
    }

    if (data.enableOCR !== undefined && typeof data.enableOCR !== 'boolean') {
      errors.enableOCR = 'Enable OCR must be a boolean value';
    }

    if (data.ocrApiKey && typeof data.ocrApiKey !== 'string') {
      errors.ocrApiKey = 'OCR API key must be a string';
    }

    if (Object.keys(errors).length > 0) {
      throw new ChurchSettingsValidationError(errors);
    }
  }

  /**
   * Validate business rules for church operations
   */
  static validateBusinessRules = {
    
    /**
     * Validate church deletion rules
     */
    canDeleteChurch: (hasUsers: boolean, hasSuperAdmins: boolean, isLastActiveChurch: boolean): void => {
      if (hasSuperAdmins) {
        throw new ChurchBusinessRuleError(
          'Cannot delete church with associated super admin users',
          { reason: 'super_admins_exist' }
        );
      }

      if (isLastActiveChurch) {
        throw new ChurchBusinessRuleError(
          'Cannot delete the last active church in the system',
          { reason: 'last_active_church' }
        );
      }
    },

    /**
     * Validate church deactivation rules
     */
    canDeactivateChurch: (isLastActiveChurch: boolean): void => {
      if (isLastActiveChurch) {
        throw new ChurchBusinessRuleError(
          'Cannot deactivate the last active church in the system',
          { reason: 'last_active_church' }
        );
      }
    },

    /**
     * Validate user transfer rules
     */
    canTransferUsers: (fromChurchExists: boolean, toChurchExists: boolean, toChurchActive: boolean): void => {
      if (!fromChurchExists) {
        throw new ChurchBusinessRuleError(
          'Source church does not exist',
          { reason: 'source_church_not_found' }
        );
      }

      if (!toChurchExists) {
        throw new ChurchBusinessRuleError(
          'Target church does not exist',
          { reason: 'target_church_not_found' }
        );
      }

      if (!toChurchActive) {
        throw new ChurchBusinessRuleError(
          'Cannot transfer users to an inactive church',
          { reason: 'target_church_inactive' }
        );
      }
    }
  };

  /**
   * Private validation helper methods
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9-]+$/;
    return slugRegex.test(slug) && !slug.startsWith('-') && !slug.endsWith('-');
  }

  private static isValidPhoneNumber(phone: string): boolean {
    // Simple phone validation - accepts various international formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
  }

  private static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private static isValidTaxId(taxId: string): boolean {
    // Brazilian CNPJ format validation
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/;
    return cnpjRegex.test(taxId);
  }

  private static isValidZipCode(zipCode: string): boolean {
    // Brazilian CEP format validation
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(zipCode);
  }

  private static isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  private static isValidCurrency(currency: string): boolean {
    const validCurrencies = ['BRL', 'USD', 'EUR', 'GBP']; // Add more as needed
    return validCurrencies.includes(currency);
  }

  private static isValidFiscalYear(fiscalYear: string): boolean {
    const validFiscalYears = ['calendar', 'april-march'];
    return validFiscalYears.includes(fiscalYear);
  }
}
