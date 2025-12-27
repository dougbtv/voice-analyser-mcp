/**
 * Word N-Gram Analyzer
 * 
 * Extracts and analyzes word-level patterns including:
 * - Bigrams (2-word sequences)
 * - Trigrams (3-word sequences)
 * - First-person phrases
 * - Hedging patterns
 * - Technical domain phrases
 * - Transitional phrases
 * 
 * These patterns capture characteristic phrase usage and
 * collocations that define voice.
 */

import { extractWordNGrams, topNGrams } from '../utils/ngrams.js';

export interface WordNGramAnalysis {
  bigrams: Array<{ ngram: string; count: number; percentage: number }>;
  trigrams: Array<{ ngram: string; count: number; percentage: number }>;
  categoryPatterns: {
    firstPerson: Array<{ ngram: string; count: number }>;
    hedging: Array<{ ngram: string; count: number }>;
    technical: Array<{ ngram: string; count: number }>;
    transitional: Array<{ ngram: string; count: number }>;
  };
  summary: {
    totalBigrams: number;
    totalTrigrams: number;
    uniqueBigrams: number;
    uniqueTrigrams: number;
  };
}

/**
 * Analyze word n-grams in text
 */
export function analyzeWordNGrams(text: string): WordNGramAnalysis {
  // Extract bigrams and trigrams
  const bigramMap = extractWordNGrams(text, 2, 2);
  const trigramMap = extractWordNGrams(text, 3, 2);
  
  // Get top n-grams
  const bigrams = topNGrams(bigramMap, 100);
  const trigrams = topNGrams(trigramMap, 50);
  
  // Categorize patterns
  const firstPerson = categorizeFirstPersonPatterns(bigramMap, trigramMap);
  const hedging = categorizeHedgingPatterns(bigramMap, trigramMap);
  const technical = categorizeTechnicalPatterns(bigramMap, trigramMap);
  const transitional = categorizeTransitionalPatterns(bigramMap, trigramMap);
  
  return {
    bigrams,
    trigrams,
    categoryPatterns: {
      firstPerson,
      hedging,
      technical,
      transitional
    },
    summary: {
      totalBigrams: Array.from(bigramMap.values()).reduce((sum, c) => sum + c, 0),
      totalTrigrams: Array.from(trigramMap.values()).reduce((sum, c) => sum + c, 0),
      uniqueBigrams: bigramMap.size,
      uniqueTrigrams: trigramMap.size
    }
  };
}

/**
 * Categorize first-person phrases
 */
function categorizeFirstPersonPatterns(
  bigrams: Map<string, number>,
  trigrams: Map<string, number>
): Array<{ ngram: string; count: number }> {
  const patterns: Array<{ ngram: string; count: number }> = [];
  
  const firstPersonMarkers = [
    "i'm", "i've", "i'd", "i'll", "i am", "i have", "i had",
    "i think", "i find", "i believe", "i know", "i feel",
    "i reckon", "i suppose", "i guess", "my", "in my"
  ];
  
  // Search in bigrams
  for (const [ngram, count] of bigrams.entries()) {
    const lower = ngram.toLowerCase();
    for (const marker of firstPersonMarkers) {
      if (lower.startsWith(marker + ' ') || lower === marker || lower.includes(' ' + marker)) {
        patterns.push({ ngram, count });
        break;
      }
    }
  }
  
  // Search in trigrams
  for (const [ngram, count] of trigrams.entries()) {
    const lower = ngram.toLowerCase();
    for (const marker of firstPersonMarkers) {
      if (lower.startsWith(marker + ' ') || lower.includes(' ' + marker)) {
        patterns.push({ ngram, count });
        break;
      }
    }
  }
  
  // Remove duplicates and sort by frequency
  const uniquePatterns = new Map<string, number>();
  for (const pattern of patterns) {
    uniquePatterns.set(pattern.ngram, pattern.count);
  }
  
  return Array.from(uniquePatterns.entries())
    .map(([ngram, count]) => ({ ngram, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

/**
 * Categorize hedging phrases (uncertainty, qualification)
 */
function categorizeHedgingPatterns(
  bigrams: Map<string, number>,
  trigrams: Map<string, number>
): Array<{ ngram: string; count: number }> {
  const patterns: Array<{ ngram: string; count: number }> = [];
  
  const hedgingMarkers = [
    "pretty sure", "pretty good", "pretty much", "quite good", "quite a",
    "i'd say", "i reckon", "i suppose", "i guess",
    "in my experience", "in my opinion", "from my",
    "actually quite", "actually pretty", "tends to", "seems to",
    "sort of", "kind of", "more or less"
  ];
  
  // Search in bigrams and trigrams
  const allNGrams = new Map([...bigrams, ...trigrams]);
  
  for (const [ngram, count] of allNGrams.entries()) {
    const lower = ngram.toLowerCase();
    for (const marker of hedgingMarkers) {
      if (lower.includes(marker)) {
        patterns.push({ ngram, count });
        break;
      }
    }
  }
  
  // Remove duplicates and sort
  const uniquePatterns = new Map<string, number>();
  for (const pattern of patterns) {
    uniquePatterns.set(pattern.ngram, pattern.count);
  }
  
  return Array.from(uniquePatterns.entries())
    .map(([ngram, count]) => ({ ngram, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

/**
 * Categorize technical/domain-specific phrases
 */
function categorizeTechnicalPatterns(
  bigrams: Map<string, number>,
  trigrams: Map<string, number>
): Array<{ ngram: string; count: number }> {
  const patterns: Array<{ ngram: string; count: number }> = [];
  
  // Technical markers (sim racing domain)
  const technicalMarkers = [
    "direct drive", "load cell", "force feedback", "sim racing",
    "wheel base", "pedal set", "button box", "racing seat",
    "triple screen", "ultra wide", "vr headset", "graphics card",
    "frame rate", "refresh rate", "display port", "usb cable",
    "motor noise", "coil whine", "ffb detail", "torque output",
    "brake force", "clutch feel", "steering ratio", "rotation angle"
  ];
  
  // Search in bigrams and trigrams
  const allNGrams = new Map([...bigrams, ...trigrams]);
  
  for (const [ngram, count] of allNGrams.entries()) {
    const lower = ngram.toLowerCase();
    for (const marker of technicalMarkers) {
      if (lower.includes(marker)) {
        patterns.push({ ngram, count });
        break;
      }
    }
  }
  
  // Remove duplicates and sort
  const uniquePatterns = new Map<string, number>();
  for (const pattern of patterns) {
    uniquePatterns.set(pattern.ngram, pattern.count);
  }
  
  return Array.from(uniquePatterns.entries())
    .map(([ngram, count]) => ({ ngram, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

/**
 * Categorize transitional phrases (British markers, connectives)
 */
function categorizeTransitionalPatterns(
  bigrams: Map<string, number>,
  trigrams: Map<string, number>
): Array<{ ngram: string; count: number }> {
  const patterns: Array<{ ngram: string; count: number }> = [];
  
  const transitionalMarkers = [
    "whilst i", "whilst the", "whilst it", "whilst you",
    "actually quite", "actually pretty", "actually a",
    "but i", "but the", "however i", "however the",
    "that said", "having said", "to be fair", "in fairness",
    "at the end", "end of the", "on the other"
  ];
  
  // Search in bigrams and trigrams
  const allNGrams = new Map([...bigrams, ...trigrams]);
  
  for (const [ngram, count] of allNGrams.entries()) {
    const lower = ngram.toLowerCase();
    for (const marker of transitionalMarkers) {
      if (lower.includes(marker)) {
        patterns.push({ ngram, count });
        break;
      }
    }
  }
  
  // Remove duplicates and sort
  const uniquePatterns = new Map<string, number>();
  for (const pattern of patterns) {
    uniquePatterns.set(pattern.ngram, pattern.count);
  }
  
  return Array.from(uniquePatterns.entries())
    .map(([ngram, count]) => ({ ngram, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

/**
 * Generate human-readable summary of word n-gram analysis
 */
export function summarizeWordNGrams(analysis: WordNGramAnalysis): string {
  const lines: string[] = [];
  
  lines.push('# Word N-Gram Patterns\n');
  lines.push(`**Analysis Summary:**`);
  lines.push(`- Total bigrams: ${analysis.summary.totalBigrams.toLocaleString()}`);
  lines.push(`- Unique bigrams: ${analysis.summary.uniqueBigrams.toLocaleString()}`);
  lines.push(`- Total trigrams: ${analysis.summary.totalTrigrams.toLocaleString()}`);
  lines.push(`- Unique trigrams: ${analysis.summary.uniqueTrigrams.toLocaleString()}`);
  lines.push('');
  
  // Top bigrams
  lines.push('## Most Frequent Bigrams\n');
  lines.push('| Bigram | Count | % |');
  lines.push('|--------|-------|---|');
  
  for (const item of analysis.bigrams.slice(0, 30)) {
    lines.push(`| ${item.ngram} | ${item.count.toLocaleString()} | ${item.percentage.toFixed(2)}% |`);
  }
  
  lines.push('');
  
  // Top trigrams
  lines.push('## Most Frequent Trigrams\n');
  lines.push('| Trigram | Count | % |');
  lines.push('|---------|-------|---|');
  
  for (const item of analysis.trigrams.slice(0, 20)) {
    lines.push(`| ${item.ngram} | ${item.count.toLocaleString()} | ${item.percentage.toFixed(2)}% |`);
  }
  
  lines.push('');
  
  // First-person patterns
  if (analysis.categoryPatterns.firstPerson.length > 0) {
    lines.push('## First-Person Patterns\n');
    lines.push('Personal voice and authority statements:');
    lines.push('');
    for (const pattern of analysis.categoryPatterns.firstPerson.slice(0, 15)) {
      lines.push(`- **${pattern.ngram}**: ${pattern.count.toLocaleString()} occurrences`);
    }
    lines.push('');
  }
  
  // Hedging patterns
  if (analysis.categoryPatterns.hedging.length > 0) {
    lines.push('## Hedging & Qualification Patterns\n');
    lines.push('Uncertainty and qualification phrases:');
    lines.push('');
    for (const pattern of analysis.categoryPatterns.hedging.slice(0, 15)) {
      lines.push(`- **${pattern.ngram}**: ${pattern.count.toLocaleString()} occurrences`);
    }
    lines.push('');
  }
  
  // Technical patterns
  if (analysis.categoryPatterns.technical.length > 0) {
    lines.push('## Technical Domain Patterns\n');
    lines.push('Domain-specific terminology and concepts:');
    lines.push('');
    for (const pattern of analysis.categoryPatterns.technical.slice(0, 15)) {
      lines.push(`- **${pattern.ngram}**: ${pattern.count.toLocaleString()} occurrences`);
    }
    lines.push('');
  }
  
  // Transitional patterns
  if (analysis.categoryPatterns.transitional.length > 0) {
    lines.push('## Transitional Patterns\n');
    lines.push('Connectives and discourse markers (including British English markers):');
    lines.push('');
    for (const pattern of analysis.categoryPatterns.transitional.slice(0, 15)) {
      lines.push(`- **${pattern.ngram}**: ${pattern.count.toLocaleString()} occurrences`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}
