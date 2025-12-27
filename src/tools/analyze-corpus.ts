/**
 * Tool: analyze_corpus
 * Perform linguistic analysis on collected corpus
 */

import fs from 'fs/promises';
import path from 'path';
import { analyzeVocabulary } from '../analyzers/vocabulary.js';
import { analyzeSentences } from '../analyzers/sentence.js';
import { analyzeVoiceMarkers } from '../analyzers/voice-markers.js';
import { analyzeParagraphs } from '../analyzers/paragraph.js';
import { analyzePunctuation, summarizePunctuation } from '../analyzers/punctuation.js';
import { analyzeFunctionWords, summarizeFunctionWordAnalysis } from '../analyzers/function-words.js';
import { analyzeCharNGrams, summarizeCharNGrams } from '../analyzers/char-ngrams.js';
import { analyzeWordNGrams, summarizeWordNGrams } from '../analyzers/word-ngrams.js';
import { analyzePOSNGrams, summarizePOSNGrams } from '../analyzers/pos-ngrams.js';
import { analyzeAntiMechanical } from '../analyzers/anti-mechanical.js';
import { analyzeInformationDensity, summarizeInformationDensity } from '../analyzers/information-density.js';

export interface AnalyzeCorpusParams {
  corpus_name: string;
  analysis_type?: 'full' | 'quick' | 'vocabulary' | 'syntax';
}

export interface AnalyzeCorpusResult {
  success: boolean;
  corpus_name: string;
  analysis_path: string;
}

export async function analyzeCorpus(params: AnalyzeCorpusParams): Promise<AnalyzeCorpusResult> {
  const { corpus_name, analysis_type = 'full' } = params;
  
  const corpusDir = path.join(process.cwd(), 'corpus', corpus_name);
  const articlesDir = path.join(corpusDir, 'articles');
  const analysisDir = path.join(corpusDir, 'analysis');
  
  // Create analysis directory
  await fs.mkdir(analysisDir, { recursive: true });
  
  // Read all article files
  const files = await fs.readdir(articlesDir);
  const markdownFiles = files.filter(f => f.endsWith('.md'));
  
  let combinedText = '';
  const articleCount = markdownFiles.length;
  
  for (const file of markdownFiles) {
    const content = await fs.readFile(path.join(articlesDir, file), 'utf-8');
    // Remove frontmatter
    const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n\n/, '');
    combinedText += withoutFrontmatter + '\n\n';
  }
  
  // Run analyses based on type
  if (analysis_type === 'full' || analysis_type === 'vocabulary') {
    const vocabAnalysis = analyzeVocabulary(combinedText);
    await fs.writeFile(
      path.join(analysisDir, 'vocabulary.json'),
      JSON.stringify(vocabAnalysis, null, 2),
      'utf-8'
    );
  }
  
  if (analysis_type === 'full' || analysis_type === 'syntax') {
    const sentenceAnalysis = analyzeSentences(combinedText);
    await fs.writeFile(
      path.join(analysisDir, 'sentence.json'),
      JSON.stringify(sentenceAnalysis, null, 2),
      'utf-8'
    );
    
    const punctuationAnalysis = analyzePunctuation(combinedText);
    await fs.writeFile(
      path.join(analysisDir, 'punctuation.json'),
      JSON.stringify(punctuationAnalysis, null, 2),
      'utf-8'
    );
    
    // Generate punctuation summary (includes AI detection for dash consistency)
    const punctuationSummary = summarizePunctuation(punctuationAnalysis);
    await fs.writeFile(
      path.join(analysisDir, 'punctuation-summary.md'),
      punctuationSummary,
      'utf-8'
    );
    
    const paragraphAnalysis = analyzeParagraphs(combinedText);
    await fs.writeFile(
      path.join(analysisDir, 'paragraph.json'),
      JSON.stringify(paragraphAnalysis, null, 2),
      'utf-8'
    );
  }
  
  if (analysis_type === 'full' || analysis_type === 'quick') {
    const voiceAnalysis = analyzeVoiceMarkers(combinedText);
    await fs.writeFile(
      path.join(analysisDir, 'voice.json'),
      JSON.stringify(voiceAnalysis, null, 2),
      'utf-8'
    );
    
    // Function word analysis with z-scores
    const functionWordAnalysis = analyzeFunctionWords(combinedText);
    await fs.writeFile(
      path.join(analysisDir, 'function-words.json'),
      JSON.stringify(functionWordAnalysis, null, 2),
      'utf-8'
    );
    
    // Generate human-readable summary
    const functionWordSummary = summarizeFunctionWordAnalysis(functionWordAnalysis);
    await fs.writeFile(
      path.join(analysisDir, 'function-words-summary.md'),
      functionWordSummary,
      'utf-8'
    );
    
    // Character n-gram analysis
    const charNGramAnalysis = analyzeCharNGrams(combinedText);
    await fs.writeFile(
      path.join(analysisDir, 'char-ngrams.json'),
      JSON.stringify(charNGramAnalysis, null, 2),
      'utf-8'
    );
    
    // Generate human-readable summary for char n-grams
    const charNGramSummary = summarizeCharNGrams(charNGramAnalysis);
    await fs.writeFile(
      path.join(analysisDir, 'char-ngrams-summary.md'),
      charNGramSummary,
      'utf-8'
    );
    
    // Word n-gram analysis
    const wordNGramAnalysis = analyzeWordNGrams(combinedText);
    await fs.writeFile(
      path.join(analysisDir, 'word-ngrams.json'),
      JSON.stringify(wordNGramAnalysis, null, 2),
      'utf-8'
    );
    
    // Generate human-readable summary for word n-grams
    const wordNGramSummary = summarizeWordNGrams(wordNGramAnalysis);
    await fs.writeFile(
      path.join(analysisDir, 'word-ngrams-summary.md'),
      wordNGramSummary,
      'utf-8'
    );
    
    // POS n-gram analysis
    const posNGramAnalysis = analyzePOSNGrams(combinedText);
    await fs.writeFile(
      path.join(analysisDir, 'pos-ngrams.json'),
      JSON.stringify(posNGramAnalysis, null, 2),
      'utf-8'
    );
    
    // Generate human-readable summary for POS n-grams
    const posNGramSummary = summarizePOSNGrams(posNGramAnalysis);
    await fs.writeFile(
      path.join(analysisDir, 'pos-ngrams-summary.md'),
      posNGramSummary,
      'utf-8'
    );
    
    // Anti-mechanical analysis
    const antiMechanicalAnalysis = analyzeAntiMechanical(combinedText);
    await fs.writeFile(
      path.join(analysisDir, 'anti-mechanical.json'),
      JSON.stringify(antiMechanicalAnalysis, null, 2),
      'utf-8'
    );
    
    // Generate anti-mechanical summary
    const antiMechanicalSummary = generateAntiMechanicalSummary(antiMechanicalAnalysis);
    await fs.writeFile(
      path.join(analysisDir, 'anti-mechanical-summary.md'),
      antiMechanicalSummary,
      'utf-8'
    );
    
    // NEW: Information density analysis (based on Dejan AI research)
    const informationDensityAnalysis = analyzeInformationDensity(combinedText, articleCount);
    await fs.writeFile(
      path.join(analysisDir, 'information-density.json'),
      JSON.stringify(informationDensityAnalysis, null, 2),
      'utf-8'
    );
    
    // Generate information density summary
    const informationDensitySummary = summarizeInformationDensity(informationDensityAnalysis);
    await fs.writeFile(
      path.join(analysisDir, 'information-density-summary.md'),
      informationDensitySummary,
      'utf-8'
    );
  }
  
  // Generate summary
  const summary = await generateSummary(analysisDir);
  await fs.writeFile(
    path.join(analysisDir, 'summary.md'),
    summary,
    'utf-8'
  );
  
  return {
    success: true,
    corpus_name,
    analysis_path: analysisDir
  };
}

async function generateSummary(analysisDir: string): Promise<string> {
  const files = await fs.readdir(analysisDir);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
  let summary = '# Analysis Summary\n\n';
  
  for (const file of jsonFiles) {
    const content = await fs.readFile(path.join(analysisDir, file), 'utf-8');
    const data = JSON.parse(content);
    
    summary += `## ${file.replace('.json', '')}\n\n`;
    summary += '```json\n';
    summary += JSON.stringify(data, null, 2).substring(0, 500) + '...\n';
    summary += '```\n\n';
  }
  
  return summary;
}

/**
 * Generate human-readable anti-mechanical analysis summary
 */
function generateAntiMechanicalSummary(analysis: ReturnType<typeof analyzeAntiMechanical>): string {
  const lines: string[] = [];
  
  lines.push('# Anti-Mechanical Analysis Summary');
  lines.push('');
  lines.push('*Evaluates writing naturalness vs robotic/AI patterns*');
  lines.push('');
  
  // Overall score
  lines.push('## Overall Naturalness Score');
  lines.push('');
  lines.push(`**Total Score:** ${analysis.naturalness.totalScore}/100 (${analysis.naturalness.interpretation.replace('_', ' ')})`);
  lines.push('');
  lines.push('| Component | Score | Max |');
  lines.push('|-----------|-------|-----|');
  lines.push(`| Sentence Variation | ${analysis.naturalness.sentenceVariationScore} | 25 |`);
  lines.push(`| Paragraph Variation | ${analysis.naturalness.paragraphVariationScore} | 25 |`);
  lines.push(`| First-Person Distribution | ${analysis.naturalness.firstPersonScore} | 25 |`);
  lines.push(`| Repetition Avoidance | ${analysis.naturalness.repetitionScore} | 25 |`);
  lines.push('');
  
  // Sentence variation
  lines.push('## Sentence Length Variation');
  lines.push('');
  lines.push(`- **Mean length:** ${analysis.sentenceLengthVariation.mean.toFixed(1)} words`);
  lines.push(`- **Standard deviation:** ±${analysis.sentenceLengthVariation.stdDev.toFixed(1)}`);
  lines.push(`- **Coefficient of variation:** ${analysis.sentenceLengthVariation.coefficientOfVariation.toFixed(2)}`);
  lines.push(`- **Natural variation:** ${analysis.sentenceLengthVariation.hasNaturalVariation ? 'Yes (CV > 0.5)' : 'No (too uniform)'}`);
  lines.push('');
  lines.push('**Length Distribution:**');
  lines.push(`- Short (1-8 words): ${analysis.sentenceLengthVariation.distribution.short}`);
  lines.push(`- Medium (9-20 words): ${analysis.sentenceLengthVariation.distribution.medium}`);
  lines.push(`- Long (21-40 words): ${analysis.sentenceLengthVariation.distribution.long}`);
  lines.push(`- Very long (40+ words): ${analysis.sentenceLengthVariation.distribution.veryLong}`);
  lines.push('');
  
  // Paragraph asymmetry
  lines.push('## Paragraph Asymmetry');
  lines.push('');
  lines.push(`- **Mean sentences per paragraph:** ${analysis.paragraphAsymmetry.meanSentences.toFixed(1)}`);
  lines.push(`- **Standard deviation:** ±${analysis.paragraphAsymmetry.stdDev.toFixed(1)}`);
  lines.push(`- **Single-sentence paragraphs:** ${analysis.paragraphAsymmetry.singleSentenceParagraphs}`);
  lines.push(`- **Long paragraphs (5+):** ${analysis.paragraphAsymmetry.longParagraphs}`);
  lines.push('');
  
  // First-person distribution
  lines.push('## First-Person Distribution');
  lines.push('');
  lines.push(`- **Total first-person instances:** ${analysis.firstPersonDistribution.totalCount}`);
  lines.push(`- **Sentence-start instances:** ${analysis.firstPersonDistribution.sentenceStartCount}`);
  lines.push(`- **Sentence-start ratio:** ${(analysis.firstPersonDistribution.sentenceStartRatio * 100).toFixed(1)}%`);
  lines.push(`- **Max consecutive "I" starts:** ${analysis.firstPersonDistribution.consecutiveIStart}`);
  lines.push(`- **Balanced distribution:** ${analysis.firstPersonDistribution.isBalanced ? 'Yes' : 'No (too many sentence starts)'}`);
  lines.push('');
  
  // Repetitive starts
  lines.push('## Repetitive Starts');
  lines.push('');
  lines.push(`- **Max consecutive same-start:** ${analysis.repetitiveStarts.maxConsecutiveSameStart}`);
  lines.push(`- **Has repetition problem:** ${analysis.repetitiveStarts.hasRepetitionProblem ? 'Yes' : 'No'}`);
  if (analysis.repetitiveStarts.problematicPatterns.length > 0) {
    lines.push(`- **Problematic patterns:** ${analysis.repetitiveStarts.problematicPatterns.join(', ')}`);
  }
  lines.push('');
  
  // Interpretation guide
  lines.push('## Interpretation Guide');
  lines.push('');
  lines.push('| Score Range | Interpretation |');
  lines.push('|-------------|----------------|');
  lines.push('| 85-100 | Very natural - authentic human writing |');
  lines.push('| 65-84 | Natural - good variation |');
  lines.push('| 45-64 | Somewhat mechanical - needs more variation |');
  lines.push('| 0-44 | Mechanical - likely AI-generated or very formulaic |');
  lines.push('');
  
  return lines.join('\n');
}
