/**
 * Syntactic pattern analysis
 * Detects grammatical structures that differentiate AI from human writing
 * 
 * Key markers for AI detection avoidance:
 * - Present Participles: AI uses 2-5x MORE than humans
 * - Nominalizations: AI uses 1.5-2x MORE than humans  
 * - Passive Voice: AI uses ~50% LESS agentless passive than humans
 * - Part-of-Speech ratios: AI over-indexes on nouns, determiners, prepositions
 */

import nlp from 'compromise';

export interface SyntacticPatternAnalysis {
  presentParticiples: {
    count: number;
    rate: number; // per 100 words
    examples: string[];
    detectionRisk: 'safe' | 'moderate' | 'high';
    guidance: string;
  };
  nominalizations: {
    count: number;
    rate: number;
    examples: string[];
    detectionRisk: 'safe' | 'moderate' | 'high';
    guidance: string;
  };
  passiveVoice: {
    total: number;
    agentless: number;
    agentlessRate: number;
    examples: string[];
    detectionRisk: 'safe' | 'moderate' | 'high';
    guidance: string;
  };
  posRatios: {
    adjectives: number; // per 100 words
    adverbs: number;
    nouns: number;
    verbs: number;
    determiners: number;
    prepositions: number;
  };
}

/**
 * Analyze syntactic patterns in corpus
 */
export function analyzeSyntacticPatterns(text: string): SyntacticPatternAnalysis {
  const doc = nlp(text);
  const totalWords = doc.wordCount();
  
  // Present participles (-ing forms functioning as verb modifiers)
  const participles = detectPresentParticiples(doc, totalWords);
  
  // Nominalizations (abstract nouns from verbs: decision, analysis, etc.)
  const nominalizations = detectNominalizations(doc, totalWords);
  
  // Passive voice (especially agentless passive)
  const passive = detectPassiveVoice(doc, text);
  
  // Part-of-speech ratios
  const posRatios = analyzePOSRatios(doc, totalWords);
  
  return {
    presentParticiples: participles,
    nominalizations,
    passiveVoice: passive,
    posRatios
  };
}

/**
 * Detect present participles (-ing verbs)
 */
function detectPresentParticiples(doc: any, totalWords: number) {
  // Find -ing words that are verbs (not gerunds/nouns)
  const allIng = doc.match('#Gerund');
  
  // Filter to those functioning as verbs
  const participles = allIng.filter((term: any) => {
    const text = term.text().toLowerCase();
    // Basic heuristic: if preceded by auxiliary or if it's modifying
    const before = term.before('^.').text().toLowerCase();
    return ['is', 'are', 'was', 'were', 'been', 'be', 'being'].includes(before) ||
           text.endsWith('ing');
  });
  
  const count = participles.length;
  const rate = totalWords > 0 ? (count / totalWords) * 100 : 0;
  
  // AI typically uses 0.8-1.2% rate, humans 0.3-0.5%
  const aiTypicalRate = 1.0;
  const detectionRisk: 'safe' | 'moderate' | 'high' = 
    rate > aiTypicalRate * 1.5 ? 'high' :
    rate > aiTypicalRate ? 'moderate' : 'safe';
  
  return {
    count,
    rate,
    examples: participles.out('array').slice(0, 15),
    detectionRisk,
    guidance: generateParticipleGuidance(rate, aiTypicalRate)
  };
}

/**
 * Detect nominalizations (abstract nouns from verbs)
 */
function detectNominalizations(doc: any, totalWords: number) {
  // Common nominalization suffixes
  const suffixes = ['tion', 'sion', 'ment', 'ance', 'ence', 'ity', 'ness'];
  
  const nouns = doc.nouns();
  const nominalizations = nouns.filter((noun: any) => {
    const text = noun.text().toLowerCase();
    return suffixes.some(suffix => text.endsWith(suffix));
  });
  
  const count = nominalizations.length;
  const rate = totalWords > 0 ? (count / totalWords) * 100 : 0;
  
  // AI typically 1.2-1.5% rate, humans 0.6-1.0%
  const aiTypicalRate = 1.3;
  const detectionRisk: 'safe' | 'moderate' | 'high' = 
    rate > aiTypicalRate * 1.3 ? 'high' :
    rate > aiTypicalRate ? 'moderate' : 'safe';
  
  return {
    count,
    rate,
    examples: nominalizations.out('array').slice(0, 15),
    detectionRisk,
    guidance: generateNominalizationGuidance(rate, aiTypicalRate)
  };
}

/**
 * Detect passive voice constructions
 */
function detectPassiveVoice(doc: any, text: string) {
  // Find passive constructions: be-verb + past participle
  const passivePattern = doc.match('(is|are|was|were|been|be|being) #PastTense');
  
  const total = passivePattern.length;
  
  // Detect agentless passive (no "by X" following)
  let agentless = 0;
  const agentlessExamples: string[] = [];
  
  passivePattern.forEach((match: any) => {
    const afterText = match.after('^{0,3}').text().toLowerCase();
    
    // If no "by" in next 3 words, it's agentless
    if (!afterText.includes('by')) {
      agentless++;
      agentlessExamples.push(match.text());
    }
  });
  
  // Calculate rate per sentence
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const agentlessRate = sentences.length > 0 ? (agentless / sentences.length) * 100 : 0;
  
  // Humans use ~0.6% agentless rate, AI uses ~0.3%
  const humanTypicalRate = 0.6;
  const detectionRisk: 'safe' | 'moderate' | 'high' = 
    agentlessRate < humanTypicalRate * 0.5 ? 'high' :
    agentlessRate < humanTypicalRate * 0.8 ? 'moderate' : 'safe';
  
  return {
    total,
    agentless,
    agentlessRate,
    examples: agentlessExamples.slice(0, 10),
    detectionRisk,
    guidance: generatePassiveGuidance(agentlessRate, humanTypicalRate)
  };
}

/**
 * Analyze part-of-speech ratios
 */
function analyzePOSRatios(doc: any, totalWords: number) {
  const adjectives = doc.adjectives().length;
  const adverbs = doc.adverbs().length;
  const nouns = doc.nouns().length;
  const verbs = doc.verbs().length;
  
  // Determiners (the, a, this, that)
  const determiners = doc.match('#Determiner').length;
  
  // Prepositions (in, on, at, by, etc.)
  const prepositions = doc.match('#Preposition').length;
  
  return {
    adjectives: totalWords > 0 ? (adjectives / totalWords) * 100 : 0,
    adverbs: totalWords > 0 ? (adverbs / totalWords) * 100 : 0,
    nouns: totalWords > 0 ? (nouns / totalWords) * 100 : 0,
    verbs: totalWords > 0 ? (verbs / totalWords) * 100 : 0,
    determiners: totalWords > 0 ? (determiners / totalWords) * 100 : 0,
    prepositions: totalWords > 0 ? (prepositions / totalWords) * 100 : 0
  };
}

/**
 * Generate guidance for participle usage
 */
function generateParticipleGuidance(rate: number, aiTypical: number): string {
  const ratio = rate / aiTypical;
  
  if (ratio > 1.5) {
    return `HIGH RISK: Rate is ${ratio.toFixed(1)}x AI typical. REDUCE -ing verb forms. Convert to simple verbs: "The system runs" not "The system is running"`;
  } else if (ratio > 1.0) {
    return `MODERATE RISK: Rate is ${ratio.toFixed(1)}x AI typical. Consider reducing -ing forms where possible.`;
  } else {
    return `SAFE: Rate is ${ratio.toFixed(1)}x AI typical. Below AI pattern - good differentiation.`;
  }
}

/**
 * Generate guidance for nominalization usage
 */
function generateNominalizationGuidance(rate: number, aiTypical: number): string {
  const ratio = rate / aiTypical;
  
  if (ratio > 1.3) {
    return `HIGH RISK: Rate is ${ratio.toFixed(1)}x AI typical. REDUCE abstract nouns. Use verbs: "decide" not "make a decision", "analyze" not "perform an analysis"`;
  } else if (ratio > 1.0) {
    return `MODERATE RISK: Rate is ${ratio.toFixed(1)}x AI typical. Consider using more active verbs.`;
  } else {
    return `SAFE: Rate is ${ratio.toFixed(1)}x AI typical. Good use of active voice.`;
  }
}

/**
 * Generate guidance for passive voice usage  
 */
function generatePassiveGuidance(rate: number, humanTypical: number): string {
  const ratio = rate / humanTypical;
  
  if (ratio < 0.5) {
    return `HIGH RISK: Rate is only ${(ratio * 100).toFixed(0)}% of human typical. AI under-uses agentless passive. INCREASE passive constructions without "by X"`;
  } else if (ratio < 0.8) {
    return `MODERATE RISK: Rate is ${(ratio * 100).toFixed(0)}% of human typical. Consider adding more agentless passive voice.`;
  } else {
    return `SAFE: Rate is ${(ratio * 100).toFixed(0)}% of human typical. Good natural passive usage.`;
  }
}
