import { findInteraction, checkInteraction, INTERACTION_RULES } from '@/lib/interactions';

describe('Interactions Library', () => {
  describe('findInteraction', () => {
    it('should find warfarin and ibuprofen interaction', () => {
      const result = findInteraction('warfarin', 'ibuprofen');
      expect(result).toBeTruthy();
      expect(result?.reason).toBe('increased bleeding risk');
    });

    it('should find metformin and contrast dye interaction', () => {
      const result = findInteraction('metformin', 'contrast dye');
      expect(result).toBeTruthy();
      expect(result?.reason).toBe('lactic acidosis risk around imaging contrast');
    });

    it('should find lisinopril and spironolactone interaction', () => {
      const result = findInteraction('lisinopril', 'spironolactone');
      expect(result).toBeTruthy();
      expect(result?.reason).toBe('hyperkalemia risk');
    });

    it('should work with reversed drug order', () => {
      const result = findInteraction('ibuprofen', 'warfarin');
      expect(result).toBeTruthy();
      expect(result?.reason).toBe('increased bleeding risk');
    });

    it('should be case insensitive', () => {
      const result = findInteraction('WARFARIN', 'ibuprofen');
      expect(result).toBeTruthy();
      expect(result?.reason).toBe('increased bleeding risk');
    });

    it('should handle whitespace', () => {
      const result = findInteraction('  warfarin  ', '  ibuprofen  ');
      expect(result).toBeTruthy();
      expect(result?.reason).toBe('increased bleeding risk');
    });

    it('should return null for unknown interactions', () => {
      const result = findInteraction('aspirin', 'vitamins');
      expect(result).toBeNull();
    });
  });

  describe('checkInteraction', () => {
    it('should return risky result for known interactions', () => {
      const result = checkInteraction('warfarin', 'ibuprofen');
      expect(result).toEqual({
        pair: ['warfarin', 'ibuprofen'],
        isPotentiallyRisky: true,
        reason: 'increased bleeding risk',
        advice: 'avoid combo; consult clinician; prefer acetaminophen for pain relief',
      });
    });

    it('should return safe result for unknown interactions', () => {
      const result = checkInteraction('aspirin', 'vitamins');
      expect(result).toEqual({
        pair: ['aspirin', 'vitamins'],
        isPotentiallyRisky: false,
        reason: 'No known interaction found',
        advice: 'No specific interaction warnings found in our database. However, always consult with a healthcare professional before combining medications.',
      });
    });

    it('should preserve original drug names in result', () => {
      const result = checkInteraction('WARFARIN', 'Ibuprofen');
      expect(result.pair).toEqual(['WARFARIN', 'Ibuprofen']);
    });
  });

  describe('INTERACTION_RULES', () => {
    it('should contain exactly 3 rules', () => {
      expect(INTERACTION_RULES).toHaveLength(3);
    });

    it('should have all risky interactions', () => {
      INTERACTION_RULES.forEach(rule => {
        expect(rule.risky).toBe(true);
      });
    });

    it('should have proper structure', () => {
      INTERACTION_RULES.forEach(rule => {
        expect(rule).toHaveProperty('drugs');
        expect(rule).toHaveProperty('risky');
        expect(rule).toHaveProperty('reason');
        expect(rule).toHaveProperty('advice');
        expect(rule.drugs).toHaveLength(2);
        expect(typeof rule.reason).toBe('string');
        expect(typeof rule.advice).toBe('string');
      });
    });
  });
});