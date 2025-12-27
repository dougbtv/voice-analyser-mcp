/**
 * Character N-Gram Analyzer
 * 
 * Extracts and analyzes character-level patterns including:
 * - Trigrams (3-character sequences)
 * - Tetragrams (4-character sequences)
 * - Contraction patterns
 * - Punctuation patterns
 * - Affix patterns
 * 
 * These patterns capture spelling habits, punctuation style,
 * and morphological preferences.
 */

import { extractCharNGrams, topNGrams } from '../utils/ngrams.js';

export interface CharNGramAnalysis {
  trigrams: Array<{ ngram: string; count: number; percentage: number }>;
  tetragrams: Array<{ ngram: string; count: number; percentage: number }>;
  patterns: {
    contractions: Array<{ pattern: string; count: number }>;
    punctuation: Array<{ pattern: string; count: number }>;
    affixes: Array<{ pattern: string; count: number }>;
  };
  summary: {
    totalTrigrams: number;
    totalTetragrams: number;
    uniqueTrigrams: number;
    uniqueTetragrams: number;
  };
}

/**
 * Analyze character n-grams in text
 */
export function analyzeCharNGrams(text: string): CharNGramAnalysis {
  // Extract trigrams and tetragrams
  const trigramMap = extractCharNGrams(text, 3, 2);
  const tetragramMap = extractCharNGrams(text, 4, 2);
  
  // Get top n-grams
  const trigrams = topNGrams(trigramMap, 200);
  const tetragrams = topNGrams(tetragramMap, 100);
  
  // Detect specific patterns
  const contractions = detectContractionPatterns(trigramMap, tetragramMap);
  const punctuation = detectPunctuationPatterns(trigramMap, tetragramMap);
  const affixes = detectAffixPatterns(trigramMap, tetragramMap);
  
  return {
    trigrams,
    tetragrams,
    patterns: {
      contractions,
      punctuation,
      affixes
    },
    summary: {
      totalTrigrams: Array.from(trigramMap.values()).reduce((sum, c) => sum + c, 0),
      totalTetragrams: Array.from(tetragramMap.values()).reduce((sum, c) => sum + c, 0),
      uniqueTrigrams: trigramMap.size,
      uniqueTetragrams: tetragramMap.size
    }
  };
}

/**
 * Detect contraction patterns ('ve, n't, 'll, etc.)
 */
function detectContractionPatterns(
  trigrams: Map<string, number>,
  tetragrams: Map<string, number>
): Array<{ pattern: string; count: number }> {
  const patterns: Array<{ pattern: string; count: number }> = [];
  
  // Common contraction patterns to look for
  const contractionMarkers = [
    "'ve", "'ll", "'re", "'d ", "n't", "'s ", "'m "
  ];
  
  // Search in trigrams
  for (const [ngram, count] of trigrams.entries()) {
    for (const marker of contractionMarkers) {
      if (ngram.includes(marker)) {
        const existing = patterns.find(p => p.pattern === marker);
        if (existing) {
          existing.count += count;
        } else {
          patterns.push({ pattern: marker, count });
        }
      }
    }
  }
  
  // Sort by frequency
  return patterns
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

/**
 * Detect punctuation patterns (..., - , !", etc.)
 */
function detectPunctuationPatterns(
  trigrams: Map<string, number>,
  tetragrams: Map<string, number>
): Array<{ pattern: string; count: number }> {
  const patterns: Array<{ pattern: string; count: number }> = [];
  
  // Search for punctuation-heavy n-grams
  for (const [ngram, count] of trigrams.entries()) {
    // Count punctuation characters
    const punctCount = (ngram.match(/[.,!?;:\-—…"'()]/g) || []).length;
    
    // If mostly punctuation or contains interesting patterns
    if (punctCount >= 2 || /\.{2,3}/.test(ngram) || / - /.test(ngram) || /!["']/.test(ngram)) {
      patterns.push({ pattern: ngram, count });
    }
  }
  
  // Sort by frequency
  return patterns
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

/**
 * Detect affix patterns (pre-, -tion, -ness, etc.)
 */
function detectAffixPatterns(
  trigrams: Map<string, number>,
  tetragrams: Map<string, number>
): Array<{ pattern: string; count: number }> {
  const patterns: Array<{ pattern: string; count: number }> = [];
  
  // Common affixes to detect
  const prefixes = ['pre', 'un-', 're-', 'de-', 'dis', 'non'];
  const suffixes = ['ing', 'ion', 'tion', 'ness', 'ment', 'ful', 'less', 'ise', 'ize', 'ly '];
  
  // Search in trigrams and tetragrams
  const allNGrams = new Map([...trigrams, ...tetragrams]);
  
  for (const [ngram, count] of allNGrams.entries()) {
    // Check for prefixes (word boundary before)
    for (const prefix of prefixes) {
      if (ngram.startsWith(` ${prefix}`) || ngram.startsWith(`-${prefix}`)) {
        const existing = patterns.find(p => p.pattern === prefix);
        if (existing) {
          existing.count += count;
        } else {
          patterns.push({ pattern: prefix, count });
        }
      }
    }
    
    // Check for suffixes (word boundary after)
    for (const suffix of suffixes) {
      if (ngram.endsWith(suffix)) {
        const existing = patterns.find(p => p.pattern === suffix);
        if (existing) {
          existing.count += count;
        } else {
          patterns.push({ pattern: suffix, count });
        }
      }
    }
  }
  
  // Sort by frequency
  return patterns
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

/**
 * Generate human-readable summary of character n-gram analysis
 */
export function summarizeCharNGrams(analysis: CharNGramAnalysis): string {
  const lines: string[] = [];
  
  lines.push('# Character N-Gram Patterns\n');
  lines.push(`**Analysis Summary:**`);
  lines.push(`- Total trigrams: ${analysis.summary.totalTrigrams.toLocaleString()}`);
  lines.push(`- Unique trigrams: ${analysis.summary.uniqueTrigrams.toLocaleString()}`);
  lines.push(`- Total tetragrams: ${analysis.summary.totalTetragrams.toLocaleString()}`);
  lines.push(`- Unique tetragrams: ${analysis.summary.uniqueTetragrams.toLocaleString()}`);
  lines.push('');
  
  // Top trigrams
  lines.push('## Most Frequent Character Trigrams\n');
  lines.push('| Trigram | Count | % |');
  lines.push('|---------|-------|---|');
  
  for (const item of analysis.trigrams.slice(0, 30)) {
    const escaped = item.ngram
      .replace(/\\/g, '\\\\')
      .replace(/\|/g, '\\|')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t');
    lines.push(`| \`${escaped}\` | ${item.count.toLocaleString()} | ${item.percentage.toFixed(2)}% |`);
  }
  
  lines.push('');
  
  // Top tetragrams
  lines.push('## Most Frequent Character Tetragrams\n');
  lines.push('| Tetragram | Count | % |');
  lines.push('|-----------|-------|---|');
  
  for (const item of analysis.tetragrams.slice(0, 20)) {
    const escaped = item.ngram
      .replace(/\\/g, '\\\\')
      .replace(/\|/g, '\\|')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t');
    lines.push(`| \`${escaped}\` | ${item.count.toLocaleString()} | ${item.percentage.toFixed(2)}% |`);
  }
  
  lines.push('');
  
  // Contraction patterns
  if (analysis.patterns.contractions.length > 0) {
    lines.push('## Contraction Patterns\n');
    lines.push('Distinctive contraction usage:');
    lines.push('');
    for (const pattern of analysis.patterns.contractions.slice(0, 10)) {
      lines.push(`- \`${pattern.pattern}\`: ${pattern.count.toLocaleString()} occurrences`);
    }
    lines.push('');
  }
  
  // Punctuation patterns
  if (analysis.patterns.punctuation.length > 0) {
    lines.push('## Punctuation Patterns\n');
    lines.push('Characteristic punctuation sequences:');
    lines.push('');
    for (const pattern of analysis.patterns.punctuation.slice(0, 15)) {
      const escaped = pattern.pattern
        .replace(/\\/g, '\\\\')
        .replace(/\|/g, '\\|')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t');
      lines.push(`- \`${escaped}\`: ${pattern.count.toLocaleString()} occurrences`);
    }
    lines.push('');
  }
  
  // Affix patterns
  if (analysis.patterns.affixes.length > 0) {
    lines.push('## Affix Patterns\n');
    lines.push('Common prefixes and suffixes:');
    lines.push('');
    for (const pattern of analysis.patterns.affixes.slice(0, 15)) {
      lines.push(`- \`${pattern.pattern}\`: ${pattern.count.toLocaleString()} occurrences`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}
