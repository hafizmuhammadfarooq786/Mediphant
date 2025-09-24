interface InteractionRule {
  drugs: [string, string];
  risky: boolean;
  reason: string;
  advice: string;
}

export const INTERACTION_RULES: InteractionRule[] = [
  {
    drugs: ['warfarin', 'ibuprofen'],
    risky: true,
    reason: 'increased bleeding risk',
    advice: 'avoid combo; consult clinician; prefer acetaminophen for pain relief',
  },
  {
    drugs: ['metformin', 'contrast dye'],
    risky: true,
    reason: 'lactic acidosis risk around imaging contrast',
    advice: 'hold metformin per imaging protocol',
  },
  {
    drugs: ['lisinopril', 'spironolactone'],
    risky: true,
    reason: 'hyperkalemia risk',
    advice: 'monitor potassium, consult clinician',
  },
];

export function findInteraction(medA: string, medB: string): InteractionRule | null {
  const normalizedA = medA.toLowerCase().trim();
  const normalizedB = medB.toLowerCase().trim();

  return INTERACTION_RULES.find(rule => {
    const [drug1, drug2] = rule.drugs.map(d => d.toLowerCase());
    return (
      (drug1 === normalizedA && drug2 === normalizedB) ||
      (drug1 === normalizedB && drug2 === normalizedA)
    );
  }) || null;
}

export interface InteractionResult {
  pair: [string, string];
  isPotentiallyRisky: boolean;
  reason: string;
  advice: string;
}

export function checkInteraction(medA: string, medB: string): InteractionResult {
  const interaction = findInteraction(medA, medB);

  if (interaction) {
    return {
      pair: [medA, medB] as [string, string],
      isPotentiallyRisky: interaction.risky,
      reason: interaction.reason,
      advice: interaction.advice,
    };
  } else {
    return {
      pair: [medA, medB] as [string, string],
      isPotentiallyRisky: false,
      reason: 'No known interaction found',
      advice: 'No specific interaction warnings found in our database. However, always consult with a healthcare professional before combining medications.',
    };
  }
}