import { z } from 'zod';
import {
  ERROR_MESSAGES,
  VALIDATION_PATTERNS
} from '@/lib/constants';

// Recreate the same schema used in the API route
const InteractionRequestSchema = z.object({
  medA: z.string()
    .min(VALIDATION_PATTERNS.MIN_MEDICATION_LENGTH, ERROR_MESSAGES.REQUIRED_FIELD)
    .max(VALIDATION_PATTERNS.MAX_MEDICATION_LENGTH, ERROR_MESSAGES.MEDICATION_NAME_TOO_LONG)
    .trim()
    .regex(VALIDATION_PATTERNS.MEDICATION_NAME, ERROR_MESSAGES.INVALID_MEDICATION_NAME),
  medB: z.string()
    .min(VALIDATION_PATTERNS.MIN_MEDICATION_LENGTH, ERROR_MESSAGES.REQUIRED_FIELD)
    .max(VALIDATION_PATTERNS.MAX_MEDICATION_LENGTH, ERROR_MESSAGES.MEDICATION_NAME_TOO_LONG)
    .trim()
    .regex(VALIDATION_PATTERNS.MEDICATION_NAME, ERROR_MESSAGES.INVALID_MEDICATION_NAME),
});

describe('Zod Validation Schemas', () => {
  describe('InteractionRequestSchema', () => {
    describe('valid inputs', () => {
      it('should accept valid medication names', () => {
        const validInputs = [
          { medA: 'warfarin', medB: 'ibuprofen' },
          { medA: 'Warfarin', medB: 'Ibuprofen' },
          { medA: 'metformin', medB: 'contrast dye' },
          { medA: 'lisinopril', medB: 'spironolactone' },
          { medA: 'acetaminophen', medB: 'caffeine' },
        ];

        validInputs.forEach(input => {
          expect(() => InteractionRequestSchema.parse(input)).not.toThrow();
        });
      });

      it('should accept medications with numbers', () => {
        const input = { medA: 'med123', medB: 'drug456' };
        expect(() => InteractionRequestSchema.parse(input)).not.toThrow();
      });

      it('should accept medications with hyphens and dots', () => {
        const input = { medA: 'co-trimoxazole', medB: 'acetyl-salicylic.acid' };
        expect(() => InteractionRequestSchema.parse(input)).not.toThrow();
      });

      it('should trim whitespace from inputs', () => {
        const input = { medA: '  warfarin  ', medB: '  ibuprofen  ' };
        const result = InteractionRequestSchema.parse(input);

        expect(result.medA).toBe('warfarin');
        expect(result.medB).toBe('ibuprofen');
      });

      it('should accept single character names', () => {
        const input = { medA: 'A', medB: 'B' };
        expect(() => InteractionRequestSchema.parse(input)).not.toThrow();
      });

      it('should accept maximum length names', () => {
        const maxLengthName = 'a'.repeat(VALIDATION_PATTERNS.MAX_MEDICATION_LENGTH);
        const input = { medA: maxLengthName, medB: 'ibuprofen' };

        expect(() => InteractionRequestSchema.parse(input)).not.toThrow();
      });
    });

    describe('invalid inputs - missing fields', () => {
      it('should reject missing medA', () => {
        const input = { medB: 'ibuprofen' };

        expect(() => InteractionRequestSchema.parse(input)).toThrow(z.ZodError);
      });

      it('should reject missing medB', () => {
        const input = { medA: 'warfarin' };

        expect(() => InteractionRequestSchema.parse(input)).toThrow(z.ZodError);
      });

      it('should reject empty object', () => {
        const input = {};

        expect(() => InteractionRequestSchema.parse(input)).toThrow(z.ZodError);
      });
    });

    describe('invalid inputs - empty strings', () => {
      it('should reject empty medA', () => {
        const input = { medA: '', medB: 'ibuprofen' };

        try {
          InteractionRequestSchema.parse(input);
          fail('Should have thrown ZodError');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.errors[0].message).toBe(ERROR_MESSAGES.REQUIRED_FIELD);
        }
      });

      it('should reject empty medB', () => {
        const input = { medA: 'warfarin', medB: '' };

        try {
          InteractionRequestSchema.parse(input);
          fail('Should have thrown ZodError');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.errors[0].message).toBe(ERROR_MESSAGES.REQUIRED_FIELD);
        }
      });

      it('should reject whitespace-only strings after trimming', () => {
        const input = { medA: '   ', medB: 'ibuprofen' };

        try {
          InteractionRequestSchema.parse(input);
          fail('Should have thrown ZodError');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          // Should have an error for medA - either required field or invalid characters
          const medAError = zodError.errors.find(e => e.path.includes('medA'));
          expect(medAError).toBeDefined();
          expect([ERROR_MESSAGES.REQUIRED_FIELD, ERROR_MESSAGES.INVALID_MEDICATION_NAME]).toContain(medAError!.message);
        }
      });
    });

    describe('invalid inputs - too long', () => {
      it('should reject medA that exceeds maximum length', () => {
        const tooLongName = 'a'.repeat(VALIDATION_PATTERNS.MAX_MEDICATION_LENGTH + 1);
        const input = { medA: tooLongName, medB: 'ibuprofen' };

        try {
          InteractionRequestSchema.parse(input);
          fail('Should have thrown ZodError');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.errors[0].message).toBe(ERROR_MESSAGES.MEDICATION_NAME_TOO_LONG);
        }
      });

      it('should reject medB that exceeds maximum length', () => {
        const tooLongName = 'b'.repeat(VALIDATION_PATTERNS.MAX_MEDICATION_LENGTH + 1);
        const input = { medA: 'warfarin', medB: tooLongName };

        try {
          InteractionRequestSchema.parse(input);
          fail('Should have thrown ZodError');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.errors[0].message).toBe(ERROR_MESSAGES.MEDICATION_NAME_TOO_LONG);
        }
      });
    });

    describe('invalid inputs - invalid characters', () => {
      it('should reject special characters not allowed in medication names', () => {
        const invalidInputs = [
          { medA: 'med@name', medB: 'ibuprofen' },
          { medA: 'warfarin', medB: 'med#name' },
          { medA: 'med$name', medB: 'ibuprofen' },
          { medA: 'warfarin', medB: 'med%name' },
          { medA: 'med^name', medB: 'ibuprofen' },
          { medA: 'warfarin', medB: 'med&name' },
          { medA: 'med*name', medB: 'ibuprofen' },
          { medA: 'warfarin', medB: 'med(name)' },
          { medA: 'med=name', medB: 'ibuprofen' },
          { medA: 'warfarin', medB: 'med+name' },
          { medA: 'med[name]', medB: 'ibuprofen' },
          { medA: 'warfarin', medB: 'med{name}' },
          { medA: 'med|name', medB: 'ibuprofen' },
          { medA: 'warfarin', medB: 'med\\name' },
          { medA: 'med:name', medB: 'ibuprofen' },
          { medA: 'warfarin', medB: 'med;name' },
          { medA: 'med"name', medB: 'ibuprofen' },
          { medA: 'warfarin', medB: "med'name" },
          { medA: 'med<name', medB: 'ibuprofen' },
          { medA: 'warfarin', medB: 'med>name' },
          { medA: 'med,name', medB: 'ibuprofen' },
          { medA: 'warfarin', medB: 'med?name' },
          { medA: 'med/name', medB: 'ibuprofen' },
        ];

        invalidInputs.forEach(input => {
          try {
            InteractionRequestSchema.parse(input);
            fail(`Should have thrown ZodError for input: ${JSON.stringify(input)}`);
          } catch (error) {
            expect(error).toBeInstanceOf(z.ZodError);
            const zodError = error as z.ZodError;
            expect(zodError.errors[0].message).toBe(ERROR_MESSAGES.INVALID_MEDICATION_NAME);
          }
        });
      });

      it('should reject unicode characters', () => {
        const invalidInputs = [
          { medA: 'médication', medB: 'ibuprofen' },
          { medA: 'warfarin', medB: 'medicação' },
          { medA: '药物', medB: 'ibuprofen' },
          { medA: 'warfarin', medB: 'лекарство' },
        ];

        invalidInputs.forEach(input => {
          try {
            InteractionRequestSchema.parse(input);
            fail(`Should have thrown ZodError for input: ${JSON.stringify(input)}`);
          } catch (error) {
            expect(error).toBeInstanceOf(z.ZodError);
            const zodError = error as z.ZodError;
            expect(zodError.errors[0].message).toBe(ERROR_MESSAGES.INVALID_MEDICATION_NAME);
          }
        });
      });
    });

    describe('invalid inputs - wrong types', () => {
      it('should reject non-string medA', () => {
        const invalidInputs = [
          { medA: 123, medB: 'ibuprofen' },
          { medA: null, medB: 'ibuprofen' },
          { medA: undefined, medB: 'ibuprofen' },
          { medA: [], medB: 'ibuprofen' },
          { medA: {}, medB: 'ibuprofen' },
          { medA: true, medB: 'ibuprofen' },
        ];

        invalidInputs.forEach(input => {
          expect(() => InteractionRequestSchema.parse(input)).toThrow(z.ZodError);
        });
      });

      it('should reject non-string medB', () => {
        const invalidInputs = [
          { medA: 'warfarin', medB: 123 },
          { medA: 'warfarin', medB: null },
          { medA: 'warfarin', medB: undefined },
          { medA: 'warfarin', medB: [] },
          { medA: 'warfarin', medB: {} },
          { medA: 'warfarin', medB: true },
        ];

        invalidInputs.forEach(input => {
          expect(() => InteractionRequestSchema.parse(input)).toThrow(z.ZodError);
        });
      });
    });

    describe('error message structure', () => {
      it('should provide detailed error information', () => {
        const input = { medA: 'invalid@name', medB: '' };

        try {
          InteractionRequestSchema.parse(input);
          fail('Should have thrown ZodError');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;

          expect(zodError.errors.length).toBeGreaterThan(0);

          // Check that medA has invalid character error
          const medAError = zodError.errors.find(e => e.path.includes('medA') && e.message === ERROR_MESSAGES.INVALID_MEDICATION_NAME);
          expect(medAError).toBeDefined();

          // Check that medB has required field error
          const medBError = zodError.errors.find(e => e.path.includes('medB') && e.message === ERROR_MESSAGES.REQUIRED_FIELD);
          expect(medBError).toBeDefined();
        }
      });
    });
  });

  describe('VALIDATION_PATTERNS', () => {
    describe('MEDICATION_NAME regex', () => {
      it('should match valid medication names', () => {
        const validNames = [
          'warfarin',
          'Warfarin',
          'WARFARIN',
          'acetaminophen',
          'co-trimoxazole',
          'acetyl-salicylic.acid',
          'med123',
          'drug 456',
          'A',
          'a'.repeat(100),
        ];

        validNames.forEach(name => {
          expect(VALIDATION_PATTERNS.MEDICATION_NAME.test(name)).toBe(true);
        });
      });

      it('should not match invalid medication names', () => {
        const invalidNames = [
          'med@name',
          'med#name',
          'med$name',
          'med%name',
          'med^name',
          'med&name',
          'med*name',
          'med(name)',
          'med=name',
          'med+name',
          'med[name]',
          'med{name}',
          'med|name',
          'med\\name',
          'med:name',
          'med;name',
          'med"name',
          "med'name",
          'med<name',
          'med>name',
          'med,name',
          'med?name',
          'med/name',
          'médication',
          '药物',
          'лекарство',
        ];

        invalidNames.forEach(name => {
          expect(VALIDATION_PATTERNS.MEDICATION_NAME.test(name)).toBe(false);
        });
      });
    });

    it('should have correct length constraints', () => {
      expect(VALIDATION_PATTERNS.MIN_MEDICATION_LENGTH).toBe(1);
      expect(VALIDATION_PATTERNS.MAX_MEDICATION_LENGTH).toBe(100);
    });
  });

  describe('ERROR_MESSAGES constants', () => {
    it('should have all required error messages', () => {
      expect(ERROR_MESSAGES.REQUIRED_FIELD).toBeDefined();
      expect(ERROR_MESSAGES.MEDICATION_NAME_TOO_LONG).toBeDefined();
      expect(ERROR_MESSAGES.INVALID_MEDICATION_NAME).toBeDefined();
      expect(ERROR_MESSAGES.DUPLICATE_MEDICATIONS).toBeDefined();

      expect(typeof ERROR_MESSAGES.REQUIRED_FIELD).toBe('string');
      expect(typeof ERROR_MESSAGES.MEDICATION_NAME_TOO_LONG).toBe('string');
      expect(typeof ERROR_MESSAGES.INVALID_MEDICATION_NAME).toBe('string');
      expect(typeof ERROR_MESSAGES.DUPLICATE_MEDICATIONS).toBe('string');
    });
  });
});