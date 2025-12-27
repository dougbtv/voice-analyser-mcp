/**
 * POS (Part-of-Speech) N-Gram Analyzer
 * 
 * Extracts and analyzes syntactic patterns using POS tagging:
 * - POS bigrams (e.g., PRON VERB, ADJ NOUN)
 * - POS trigrams (e.g., CONJ PRON VERB, ADV ADJ NOUN)
 * - Sentence starter patterns
 * - Modification patterns
 * - Clause patterns
 * 
 * These patterns capture syntactic structure and grammatical
 * preferences that define writing style.
 */

import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';

const nlp = winkNLP(model);
const its = nlp.its;

export interface POSNGramAnalysis {
  bigrams: Array<{ ngram: string; count: number; percentage: number; example: string }>;
  trigrams: Array<{ ngram: string; count: number; percentage: number; example: string }>;
  patterns: {
    sentenceStarters: Array<{ pattern: string; count: number; examples: string[] }>;
    modifications: Array<{ pattern: string; count: number; examples: string[] }>;
    clauses: Array<{ pattern: string; count: number; examples: string[] }>;
  };
  summary: {
    totalBigrams: number;
    totalTrigrams: number;
    uniqueBigrams: number;
    uniqueTrigrams: number;
  };
}

interface POSNGramEntry {
  count: number;
  examples: string[];
}

/**
 * Analyze POS n-grams in text
 */
export function analyzePOSNGrams(text: string): POSNGramAnalysis {
  // Extract POS bigrams and trigrams
  const bigramMap = extractPOSNGrams(text, 2);
  const trigramMap = extractPOSNGrams(text, 3);
  
  // Get top n-grams with examples
  const bigrams = topPOSNGrams(bigramMap, 50);
  const trigrams = topPOSNGrams(trigramMap, 30);
  
  // Categorize patterns
  const sentenceStarters = categorizeSentenceStarters(bigramMap, trigramMap);
  const modifications = categorizeModifications(bigramMap, trigramMap);
  const clauses = categorizeClauses(bigramMap, trigramMap);
  
  // Calculate totals
  const totalBigrams = Array.from(bigramMap.values())
    .reduce((sum, entry) => sum + entry.count, 0);
  const totalTrigrams = Array.from(trigramMap.values())
    .reduce((sum, entry) => sum + entry.count, 0);
  
  return {
    bigrams,
    trigrams,
    patterns: {
      sentenceStarters,
      modifications,
      clauses
    },
    summary: {
      totalBigrams,
      totalTrigrams,
      uniqueBigrams: bigramMap.size,
      uniqueTrigrams: trigramMap.size
    }
  };
}

/**
 * Extract POS n-grams with word examples
 */
function extractPOSNGrams(text: string, n: number): Map<string, POSNGramEntry> {
  const ngrams = new Map<string, POSNGramEntry>();
  
  const doc = nlp.readDoc(text);
  const sentences = doc.sentences().out();
  
  for (const sentence of sentences) {
    const sentDoc = nlp.readDoc(sentence);
    const tokens = sentDoc.tokens();
    const poses = tokens.out(its.pos);
    const words = tokens.out();
    
    // Extract n-grams
    for (let i = 0; i <= poses.length - n; i++) {
      const posNGram = poses.slice(i, i + n).join(' ');
      const wordExample = words.slice(i, i + n).join(' ');
      
      if (!ngrams.has(posNGram)) {
        ngrams.set(posNGram, { count: 0, examples: [] });
      }
      
      const entry = ngrams.get(posNGram)!;
      entry.count++;
      
      // Store up to 3 unique examples
      if (entry.examples.length < 3 && !entry.examples.includes(wordExample)) {
        entry.examples.push(wordExample);
      }
    }
  }
  
  return ngrams;
}

/**
 * Get top N POS n-grams with examples
 */
function topPOSNGrams(
  ngrams: Map<string, POSNGramEntry>,
  topN: number
): Array<{ ngram: string; count: number; percentage: number; example: string }> {
  const total = Array.from(ngrams.values()).reduce((sum, entry) => sum + entry.count, 0);
  
  return Array.from(ngrams.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, topN)
    .map(([ngram, entry]) => ({
      ngram,
      count: entry.count,
      percentage: (entry.count / total) * 100,
      example: entry.examples[0] || ''
    }));
}

/**
 * Categorize sentence starter patterns
 */
function categorizeSentenceStarters(
  bigrams: Map<string, POSNGramEntry>,
  trigrams: Map<string, POSNGramEntry>
): Array<{ pattern: string; count: number; examples: string[] }> {
  const patterns: Map<string, POSNGramEntry> = new Map();
  
  // Common sentence starter patterns
  const starterPatterns = [
    'PRON VERB',      // I've, I'm, I'd
    'PRON AUX',       // I have, I am
    'ADV PRON',       // Actually I, Whilst I
    'CONJ PRON',      // And I, But I, Whilst I
    'VERB PRON',      // Having said
    'ADJ NOUN',       // Direct drive
    'DET NOUN'        // The problem, A solution
  ];
  
  // Search in bigrams
  for (const pattern of starterPatterns) {
    const entry = bigrams.get(pattern);
    if (entry) {
      patterns.set(pattern, entry);
    }
  }
  
  return Array.from(patterns.entries())
    .map(([pattern, entry]) => ({
      pattern,
      count: entry.count,
      examples: entry.examples.slice(0, 3)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

/**
 * Categorize modification patterns (adjective-noun, adverb-adjective)
 */
function categorizeModifications(
  bigrams: Map<string, POSNGramEntry>,
  trigrams: Map<string, POSNGramEntry>
): Array<{ pattern: string; count: number; examples: string[] }> {
  const patterns: Map<string, POSNGramEntry> = new Map();
  
  const modificationPatterns = [
    'ADJ NOUN',       // direct drive, good feel
    'ADV ADJ',        // pretty sure, quite good, actually quite
    'ADV VERB',       // actually works, really matters
    'DET ADJ NOUN'    // the best option
  ];
  
  // Search in bigrams and trigrams
  for (const pattern of modificationPatterns) {
    const bigramEntry = bigrams.get(pattern);
    if (bigramEntry) {
      patterns.set(pattern, bigramEntry);
    }
    
    const trigramEntry = trigrams.get(pattern);
    if (trigramEntry) {
      patterns.set(pattern, trigramEntry);
    }
  }
  
  return Array.from(patterns.entries())
    .map(([pattern, entry]) => ({
      pattern,
      count: entry.count,
      examples: entry.examples.slice(0, 3)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

/**
 * Categorize clause patterns
 */
function categorizeClauses(
  bigrams: Map<string, POSNGramEntry>,
  trigrams: Map<string, POSNGramEntry>
): Array<{ pattern: string; count: number; examples: string[] }> {
  const patterns: Map<string, POSNGramEntry> = new Map();
  
  const clausePatterns = [
    'CONJ PRON VERB', // whilst I think, but I'd
    'PRON VERB DET',  // I have the, I've got a
    'VERB DET NOUN',  // using the force, testing direct
    'AUX VERB VERB'   // have been testing
  ];
  
  // Search in trigrams
  for (const pattern of clausePatterns) {
    const entry = trigrams.get(pattern);
    if (entry) {
      patterns.set(pattern, entry);
    }
  }
  
  return Array.from(patterns.entries())
    .map(([pattern, entry]) => ({
      pattern,
      count: entry.count,
      examples: entry.examples.slice(0, 3)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

/**
 * Generate human-readable summary of POS n-gram analysis
 */
export function summarizePOSNGrams(analysis: POSNGramAnalysis): string {
  const lines: string[] = [];
  
  lines.push('# POS (Part-of-Speech) N-Gram Patterns\n');
  lines.push(`**Analysis Summary:**`);
  lines.push(`- Total POS bigrams: ${analysis.summary.totalBigrams.toLocaleString()}`);
  lines.push(`- Unique POS bigrams: ${analysis.summary.uniqueBigrams.toLocaleString()}`);
  lines.push(`- Total POS trigrams: ${analysis.summary.totalTrigrams.toLocaleString()}`);
  lines.push(`- Unique POS trigrams: ${analysis.summary.uniqueTrigrams.toLocaleString()}`);
  lines.push('');
  
  // Top bigrams
  lines.push('## Most Frequent POS Bigrams\n');
  lines.push('| POS Pattern | Count | % | Example |');
  lines.push('|-------------|-------|---|---------|');
  
  for (const item of analysis.bigrams.slice(0, 25)) {
    lines.push(`| ${item.ngram} | ${item.count.toLocaleString()} | ${item.percentage.toFixed(2)}% | ${item.example} |`);
  }
  
  lines.push('');
  
  // Top trigrams
  lines.push('## Most Frequent POS Trigrams\n');
  lines.push('| POS Pattern | Count | % | Example |');
  lines.push('|-------------|-------|---|---------|');
  
  for (const item of analysis.trigrams.slice(0, 15)) {
    lines.push(`| ${item.ngram} | ${item.count.toLocaleString()} | ${item.percentage.toFixed(2)}% | ${item.example} |`);
  }
  
  lines.push('');
  
  // Sentence starters
  if (analysis.patterns.sentenceStarters.length > 0) {
    lines.push('## Sentence Starter Patterns\n');
    lines.push('Common syntactic structures at sentence beginnings:');
    lines.push('');
    for (const pattern of analysis.patterns.sentenceStarters) {
      lines.push(`- **${pattern.pattern}** (${pattern.count.toLocaleString()} times)`);
      lines.push(`  - Examples: ${pattern.examples.join(', ')}`);
    }
    lines.push('');
  }
  
  // Modifications
  if (analysis.patterns.modifications.length > 0) {
    lines.push('## Modification Patterns\n');
    lines.push('Characteristic adjective-noun and adverb-adjective structures:');
    lines.push('');
    for (const pattern of analysis.patterns.modifications) {
      lines.push(`- **${pattern.pattern}** (${pattern.count.toLocaleString()} times)`);
      lines.push(`  - Examples: ${pattern.examples.join(', ')}`);
    }
    lines.push('');
  }
  
  // Clauses
  if (analysis.patterns.clauses.length > 0) {
    lines.push('## Clause Patterns\n');
    lines.push('Multi-word syntactic structures:');
    lines.push('');
    for (const pattern of analysis.patterns.clauses) {
      lines.push(`- **${pattern.pattern}** (${pattern.count.toLocaleString()} times)`);
      lines.push(`  - Examples: ${pattern.examples.join(', ')}`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}
