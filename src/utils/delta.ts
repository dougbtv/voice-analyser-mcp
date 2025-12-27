/**
 * Delta distance metrics for authorship attribution
 * 
 * Burrows' Delta: Standard z-score based distance
 * Cosine Delta: Directional similarity measure
 * 
 * Lower Delta = more similar authorship
 */

import { mean, standardDeviation, zScore } from './zscore.js';

/**
 * Calculate Burrows' Delta between two texts based on function word frequencies
 * 
 * Algorithm:
 * 1. Calculate z-scores for each word in both texts
 * 2. Take absolute difference of z-scores
 * 3. Average across all words
 * 
 * @param text1Freqs - Function word frequencies (per 1000 words) from text 1
 * @param text2Freqs - Function word frequencies (per 1000 words) from text 2
 * @param refStats - Reference corpus statistics (mean, stdDev for each word)
 * @returns Delta distance (lower = more similar)
 */
export function burrowsDelta(
  text1Freqs: Record<string, number>,
  text2Freqs: Record<string, number>,
  refStats: Record<string, { mean: number; stdDev: number }>
): number {
  const words = Object.keys(refStats);
  let sumDifferences = 0;
  let validWords = 0;
  
  for (const word of words) {
    const freq1 = text1Freqs[word] || 0;
    const freq2 = text2Freqs[word] || 0;
    
    const { mean: refMean, stdDev: refStdDev } = refStats[word];
    
    if (refStdDev === 0) continue; // Skip if no variation in reference
    
    const z1 = zScore(freq1, refMean, refStdDev);
    const z2 = zScore(freq2, refMean, refStdDev);
    
    sumDifferences += Math.abs(z1 - z2);
    validWords++;
  }
  
  return validWords > 0 ? sumDifferences / validWords : 0;
}

/**
 * Calculate Cosine Delta (directional similarity)
 * 
 * Interprets z-score vectors as directions in multi-dimensional space
 * Measures angle between vectors rather than absolute distance
 * 
 * @returns Delta distance (lower = more similar)
 */
export function cosineDelta(
  text1Freqs: Record<string, number>,
  text2Freqs: Record<string, number>,
  refStats: Record<string, { mean: number; stdDev: number }>
): number {
  const words = Object.keys(refStats);
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (const word of words) {
    const freq1 = text1Freqs[word] || 0;
    const freq2 = text2Freqs[word] || 0;
    
    const { mean: refMean, stdDev: refStdDev } = refStats[word];
    
    if (refStdDev === 0) continue;
    
    const z1 = zScore(freq1, refMean, refStdDev);
    const z2 = zScore(freq2, refMean, refStdDev);
    
    dotProduct += z1 * z2;
    magnitude1 += z1 * z1;
    magnitude2 += z2 * z2;
  }
  
  const magnitude = Math.sqrt(magnitude1) * Math.sqrt(magnitude2);
  
  if (magnitude === 0) return 1.0; // Maximum distance if no overlap
  
  const cosineSimilarity = dotProduct / magnitude;
  
  // Convert similarity to distance (0 = identical, 1 = opposite)
  return 1 - cosineSimilarity;
}

/**
 * Interpret Delta scores
 */
export function interpretDelta(delta: number, method: 'burrows' | 'cosine'): string {
  if (method === 'burrows') {
    if (delta < 1.0) return 'Very likely same author';
    if (delta < 1.5) return 'Likely same author';
    if (delta < 2.0) return 'Possibly same author';
    if (delta < 2.5) return 'Uncertain';
    return 'Likely different author';
  } else { // cosine
    if (delta < 0.1) return 'Very high similarity';
    if (delta < 0.3) return 'High similarity';
    if (delta < 0.5) return 'Moderate similarity';
    if (delta < 0.7) return 'Low similarity';
    return 'Very low similarity';
  }
}

/**
 * Calculate comprehensive Delta analysis between two texts
 */
export interface DeltaAnalysis {
  burrowsDelta: number;
  burrowsInterpretation: string;
  cosineDelta: number;
  cosineInterpretation: string;
  recommendation: string;
}

export function analyzeDelta(
  text1Freqs: Record<string, number>,
  text2Freqs: Record<string, number>,
  refStats: Record<string, { mean: number; stdDev: number }>
): DeltaAnalysis {
  const burrows = burrowsDelta(text1Freqs, text2Freqs, refStats);
  const cosine = cosineDelta(text1Freqs, text2Freqs, refStats);
  
  // Combined recommendation
  let recommendation: string;
  if (burrows < 1.5 && cosine < 0.3) {
    recommendation = 'Strong match - content likely from same author';
  } else if (burrows < 2.0 && cosine < 0.5) {
    recommendation = 'Moderate match - stylistically similar';
  } else if (burrows < 2.5) {
    recommendation = 'Weak match - some similarities present';
  } else {
    recommendation = 'Poor match - stylistic differences detected';
  }
  
  return {
    burrowsDelta: burrows,
    burrowsInterpretation: interpretDelta(burrows, 'burrows'),
    cosineDelta: cosine,
    cosineInterpretation: interpretDelta(cosine, 'cosine'),
    recommendation
  };
}
