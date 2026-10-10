// Official 18-type damage effectiveness matrix
// Attacking -> Defending multiplier (2 = super effective, 0.5 = not very effective, 0 = immune, default = 1)
export const TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy"
];

// attackType -> { defenseType: multiplier }
export const DAMAGE_MULTIPLIERS = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

/**
 * Calculate defensive weaknesses and resistances for given defending type(s).
 * @param {string[]} defTypes - e.g. ["fire", "flying"]
 * @returns {Record<string, string[]>} - e.g. { "4x": ["rock"], "2x": ["water", "electric"], ... }
 */
export function calculateWeaknesses(defTypes) {
  const normalizedDefTypes = defTypes.map(t => t.toLowerCase().trim()).filter(Boolean);
  const multipliers = {};

  for (const atkType of TYPES) {
    let mult = 1.0;
    for (const defType of normalizedDefTypes) {
      const match = DAMAGE_MULTIPLIERS[atkType]?.[defType];
      if (match !== undefined) {
        mult *= match;
      }
    }
    multipliers[atkType] = mult;
  }

  const result = {
    "4x": [],
    "2x": [],
    "0.5x": [],
    "0.25x": [],
    "0x": []
  };

  for (const [atkType, mult] of Object.entries(multipliers)) {
    if (mult === 4) result["4x"].push(atkType);
    else if (mult === 2) result["2x"].push(atkType);
    else if (mult === 0.5) result["0.5x"].push(atkType);
    else if (mult === 0.25) result["0.25x"].push(atkType);
    else if (mult === 0) result["0x"].push(atkType);
  }

  // Filter out empty arrays to keep JSON ultra-compact
  const compact = {};
  for (const [k, arr] of Object.entries(result)) {
    if (arr.length > 0) compact[k] = arr;
  }
  return compact;
}
