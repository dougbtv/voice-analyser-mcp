/**
 * N-gram extraction utilities for stylometric fingerprinting
 * 
 * Character n-grams: Capture spelling, punctuation patterns
 * Word n-grams: Capture phrase patterns
 * POS n-grams: Capture syntactic structure
 */

/**
 * Extract character n-grams from text
 * 
 * @param text - Input text
 * @param n - N-gram size (typically 3-4)
 * @param minFrequency - Minimum occurrence count to include
 * @returns Map of n-gram -> count
 */
export function extractCharNGrams(
  text: string,
  n: number,
  minFrequency: number = 2
): Map<string, number> {
  const ngrams = new Map<string, number>();
  
  // Preserve case and punctuation for character n-grams
  for (let i = 0; i <= text.length - n; i++) {
    const ngram = text.substring(i, i + n);
    ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
  }
  
  // Filter by minimum frequency
  for (const [ngram, count] of ngrams.entries()) {
    if (count < minFrequency) {
      ngrams.delete(ngram);
    }
  }
  
  return ngrams;
}

/**
 * Extract word n-grams from text
 * 
 * @param text - Input text
 * @param n - N-gram size (typically 2-3)
 * @param minFrequency - Minimum occurrence count
 * @returns Map of n-gram -> count
 */
export function extractWordNGrams(
  text: string,
  n: number,
  minFrequency: number = 2
): Map<string, number> {
  const ngrams = new Map<string, number>();
  
  // Tokenize into words (preserve case for now)
  const words = text
    .split(/\s+/)
    .map(w => w.toLowerCase().replace(/[^\w'-]/g, ''))
    .filter(w => w.length > 0);
  
  // Extract n-grams
  for (let i = 0; i <= words.length - n; i++) {
    const ngram = words.slice(i, i + n).join(' ');
    ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
  }
  
  // Filter by minimum frequency
  for (const [ngram, count] of ngrams.entries()) {
    if (count < minFrequency) {
      ngrams.delete(ngram);
    }
  }
  
  return ngrams;
}

/**
 * Get top N most frequent n-grams
 */
export function topNGrams(
  ngrams: Map<string, number>,
  topN: number
): Array<{ ngram: string; count: number; percentage: number }> {
  const total = Array.from(ngrams.values()).reduce((sum, count) => sum + count, 0);
  
  return Array.from(ngrams.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([ngram, count]) => ({
      ngram,
      count,
      percentage: (count / total) * 100
    }));
}

/**
 * Calculate TF-IDF-style discrimination score for n-grams
 * 
 * Identifies n-grams that are distinctive to this author compared to general usage
 * 
 * @param authorNGrams - N-gram frequencies from author's corpus
 * @param generalNGrams - N-gram frequencies from general English corpus
 * @returns Map of n-gram -> discrimination score (higher = more distinctive)
 */
export function calculateDiscriminationScores(
  authorNGrams: Map<string, number>,
  generalNGrams: Map<string, number>
): Map<string, number> {
  const scores = new Map<string, number>();
  
  const authorTotal = Array.from(authorNGrams.values()).reduce((sum, c) => sum + c, 0);
  const generalTotal = Array.from(generalNGrams.values()).reduce((sum, c) => sum + c, 0);
  
  for (const [ngram, authorCount] of authorNGrams.entries()) {
    const authorFreq = authorCount / authorTotal;
    const generalCount = generalNGrams.get(ngram) || 0.1; // Smooth with small value
    const generalFreq = generalCount / generalTotal;
    
    // Ratio of author frequency to general frequency
    // Higher = more distinctive to this author
    const score = authorFreq / generalFreq;
    scores.set(ngram, score);
  }
  
  return scores;
}

/**
 * Get most discriminative n-grams (highly distinctive to author)
 */
export function mostDiscriminativeNGrams(
  discriminationScores: Map<string, number>,
  topN: number
): Array<{ ngram: string; score: number }> {
  return Array.from(discriminationScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([ngram, score]) => ({ ngram, score }));
}

/**
 * Analyze n-gram overlap between two texts
 * 
 * Useful for checking if generated content matches author's patterns
 */
export interface NGramOverlap {
  totalInCorpus: number;
  totalInGenerated: number;
  overlap: number;
  overlapPercentage: number;
  uniqueToCorpus: number;
  uniqueToGenerated: number;
}

export function analyzeNGramOverlap(
  corpusNGrams: Map<string, number>,
  generatedNGrams: Map<string, number>
): NGramOverlap {
  const corpusSet = new Set(corpusNGrams.keys());
  const generatedSet = new Set(generatedNGrams.keys());
  
  let overlap = 0;
  for (const ngram of corpusSet) {
    if (generatedSet.has(ngram)) {
      overlap++;
    }
  }
  
  return {
    totalInCorpus: corpusSet.size,
    totalInGenerated: generatedSet.size,
    overlap,
    overlapPercentage: (overlap / corpusSet.size) * 100,
    uniqueToCorpus: corpusSet.size - overlap,
    uniqueToGenerated: generatedSet.size - overlap
  };
}

/**
 * Extract POS (Part-of-Speech) n-grams using simple pattern matching
 * 
 * Note: For full POS tagging, integrate with compromise or natural
 * This is a simplified version for basic patterns
 */
export function extractSimplePOSPatterns(text: string): Map<string, number> {
  const patterns = new Map<string, number>();
  
  // Simple regex-based patterns (not true POS tagging)
  const sentences = text.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length === 0) continue;
    
    // Detect simple patterns
    if (/^I ('m|'ve|'d|am|have|had)/.test(trimmed)) {
      patterns.set('first_person_start', (patterns.get('first_person_start') || 0) + 1);
    }
    
    if (/whilst\s+\w+/.test(trimmed)) {
      patterns.set('whilst_pattern', (patterns.get('whilst_pattern') || 0) + 1);
    }
    
    if (/\bpretty\s+sure\b/.test(trimmed)) {
      patterns.set('pretty_sure', (patterns.get('pretty_sure') || 0) + 1);
    }
    
    if (/\bactually\b/.test(trimmed)) {
      patterns.set('actually_usage', (patterns.get('actually_usage') || 0) + 1);
    }
  }
  
  return patterns;
}
