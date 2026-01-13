/**
 * Lexical diversity analysis
 * Measures vocabulary richness and word usage patterns
 * 
 * Key metrics for AI detection avoidance:
 * - Type-Token Ratio (TTR): AI typically has LOWER lexical diversity
 * - Hapax Legomena: Words appearing once - AI uses FEWER unique words
 * - Bigram Uniqueness: AI reuses more word combinations
 */

import {
  typeTokenRatio,
  movingAvgTypeTokenRatio,
  hapaxLegomenaCount,
  bigramUniqueness
} from '../utils/advanced-statistics.js';

export interface LexicalDiversityAnalysis {
  totalWords: number;
  uniqueWords: number;
  typeTokenRatio: number;
  movingAvgTTR: number;
  hapaxLegomena: {
    count: number;
    rate: number; // per 100 words
  };
  bigramUniqueness: number;
  vocabularySize: number;
  difficultWords: {
    count: number;
    rate: number; // per 100 words
    examples: string[];
  };
  aiDetectionContext: {
    ttrGuidance: string;
    hapaxGuidance: string;
    bigramGuidance: string;
  };
}

/**
 * Analyze lexical diversity of corpus
 */
export function analyzeLexicalDiversity(text: string): LexicalDiversityAnalysis {
  // Tokenize - simple word splitting
  const tokens = text
    .toLowerCase()
    .split(/\s+/)
    .filter(token => token.length > 0 && /[a-z]/.test(token));
  
  const totalWords = tokens.length;
  const uniqueWords = new Set(tokens).size;
  
  // Core diversity metrics
  const ttr = typeTokenRatio(tokens);
  const mattr = movingAvgTypeTokenRatio(tokens, 100);
  
  // Hapax legomena (words appearing only once)
  const hapaxCount = hapaxLegomenaCount(tokens);
  const hapaxRate = totalWords > 0 ? (hapaxCount / totalWords) * 100 : 0;
  
  // Bigram analysis
  const bigramUniqueRatio = bigramUniqueness(tokens);
  
  // Difficult words (3+ syllables, as proxy for complexity)
  const difficultWords = findDifficultWords(tokens);
  
  return {
    totalWords,
    uniqueWords,
    typeTokenRatio: ttr,
    movingAvgTTR: mattr,
    hapaxLegomena: {
      count: hapaxCount,
      rate: hapaxRate
    },
    bigramUniqueness: bigramUniqueRatio,
    vocabularySize: uniqueWords,
    difficultWords: {
      count: difficultWords.length,
      rate: totalWords > 0 ? (difficultWords.length / totalWords) * 100 : 0,
      examples: difficultWords.slice(0, 20)
    },
    aiDetectionContext: {
      ttrGuidance: generateTTRGuidance(ttr),
      hapaxGuidance: generateHapaxGuidance(hapaxRate),
      bigramGuidance: generateBigramGuidance(bigramUniqueRatio)
    }
  };
}

/**
 * Find difficult words (3+ syllables, uncommon terms)
 * Simplified heuristic: long words are generally more complex
 */
function findDifficultWords(tokens: string[]): string[] {
  const uniqueDifficult = new Set<string>();
  
  for (const token of tokens) {
    // Words 8+ letters as proxy for complexity
    if (token.length >= 8) {
      uniqueDifficult.add(token);
    }
  }
  
  return Array.from(uniqueDifficult).sort();
}

/**
 * Generate guidance based on TTR analysis
 */
function generateTTRGuidance(ttr: number): string {
  // Typical ranges:
  // - AI: 0.40-0.50
  // - Human: 0.50-0.70 (varies by text length and genre)
  
  if (ttr < 0.45) {
    return 'LOW diversity (AI-like). Corpus shows repetitive vocabulary. Use more varied word choices.';
  } else if (ttr < 0.55) {
    return 'MODERATE diversity. Acceptable range but consider expanding vocabulary for stronger differentiation.';
  } else {
    return 'HIGH diversity (human-like). Corpus demonstrates rich vocabulary variation.';
  }
}

/**
 * Generate guidance based on hapax legomena rate
 */
function generateHapaxGuidance(hapaxRate: number): string {
  // Typical rates:
  // - AI: 15-25% (reuses words more)
  // - Human: 30-50% (more unique word usage)
  
  if (hapaxRate < 25) {
    return 'LOW unique word usage (AI-like). Corpus repeats vocabulary. Include more one-time word usage.';
  } else if (hapaxRate < 35) {
    return 'MODERATE unique words. Acceptable but could introduce more varied vocabulary.';
  } else {
    return 'HIGH unique word usage (human-like). Strong indicator of natural writing.';
  }
}

/**
 * Generate guidance based on bigram uniqueness
 */
function generateBigramGuidance(bigramRatio: number): string {
  // Typical ratios:
  // - AI: 0.60-0.75 (reuses phrases)
  // - Human: 0.75-0.90 (more unique combinations)
  
  if (bigramRatio < 0.70) {
    return 'LOW phrase uniqueness (AI-like). Corpus reuses word combinations. Vary sentence structures.';
  } else if (bigramRatio < 0.80) {
    return 'MODERATE phrase diversity. Acceptable range.';
  } else {
    return 'HIGH phrase uniqueness (human-like). Demonstrates natural varied expression.';
  }
}
