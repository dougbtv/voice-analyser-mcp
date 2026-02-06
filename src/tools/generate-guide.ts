/**
 * Tool: generate_tov_guide
 * Generate tone-of-voice guide from analysis
 */

import fs from 'fs/promises';
import path from 'path';
import type { VocabularyAnalysis } from '../analyzers/vocabulary.js';
import type { SentenceAnalysis } from '../analyzers/sentence.js';
import type { VoiceMarkers } from '../analyzers/voice-markers.js';
import type { ParagraphAnalysis } from '../analyzers/paragraph.js';
import type { PunctuationAnalysis } from '../analyzers/punctuation.js';
import { getBaseDir } from '../utils/paths.js';

export interface GenerateTovGuideParams {
  corpus_name: string;
  output_format?: 'llm' | 'human' | 'both';
  template?: 'minimal' | 'standard' | 'comprehensive';
}

export interface GenerateTovGuideResult {
  success: boolean;
  llm_guide_path?: string;
  human_guide_path?: string;
}

export async function generateTovGuide(params: GenerateTovGuideParams): Promise<GenerateTovGuideResult> {
  const { corpus_name, output_format = 'both', template = 'standard' } = params;

  const baseDir = getBaseDir();
  const corpusDir = path.join(baseDir, 'corpus', corpus_name);
  const analysisDir = path.join(corpusDir, 'analysis');
  const templatesDir = path.join(baseDir, 'templates');
  const articlesDir = path.join(corpusDir, 'articles');
  
  await fs.mkdir(templatesDir, { recursive: true });
  
  // Load analysis files
  const vocabData = JSON.parse(
    await fs.readFile(path.join(analysisDir, 'vocabulary.json'), 'utf-8')
  ) as VocabularyAnalysis;
  
  const sentenceData = JSON.parse(
    await fs.readFile(path.join(analysisDir, 'sentence.json'), 'utf-8')
  ) as SentenceAnalysis;
  
  const voiceData = JSON.parse(
    await fs.readFile(path.join(analysisDir, 'voice.json'), 'utf-8')
  ) as VoiceMarkers;
  
  let paragraphData: ParagraphAnalysis | null = null;
  let punctuationData: PunctuationAnalysis | null = null;
  
  try {
    paragraphData = JSON.parse(
      await fs.readFile(path.join(analysisDir, 'paragraph.json'), 'utf-8')
    ) as ParagraphAnalysis;
    
    punctuationData = JSON.parse(
      await fs.readFile(path.join(analysisDir, 'punctuation.json'), 'utf-8')
    ) as PunctuationAnalysis;
  } catch (e) {
    // Optional analyses
  }
  
  // Load corpus metadata
  const corpusMetadata = JSON.parse(
    await fs.readFile(path.join(corpusDir, 'corpus.json'), 'utf-8')
  );
  
  // Extract example paragraphs
  const examples = await extractExampleParagraphs(articlesDir, 10);
  
  const result: GenerateTovGuideResult = { success: true };
  
  if (output_format === 'llm' || output_format === 'both') {
    const llmGuide = generateLlmGuide(
      corpus_name,
      corpusMetadata,
      vocabData,
      sentenceData,
      voiceData,
      paragraphData,
      punctuationData,
      examples
    );
    
    const llmPath = path.join(templatesDir, `tov-${corpus_name}-llm.md`);
    await fs.writeFile(llmPath, llmGuide, 'utf-8');
    result.llm_guide_path = llmPath;
  }
  
  if (output_format === 'human' || output_format === 'both') {
    const humanGuide = generateHumanGuide(
      corpus_name,
      corpusMetadata,
      vocabData,
      sentenceData,
      voiceData,
      paragraphData,
      punctuationData
    );
    
    const humanPath = path.join(templatesDir, `tov-${corpus_name}-human.md`);
    await fs.writeFile(humanPath, humanGuide, 'utf-8');
    result.human_guide_path = humanPath;
  }
  
  return result;
}

async function extractExampleParagraphs(articlesDir: string, count: number): Promise<string[]> {
  const files = await fs.readdir(articlesDir);
  const markdownFiles = files.filter(f => f.endsWith('.md')).slice(0, 5);
  
  const paragraphs: string[] = [];
  
  for (const file of markdownFiles) {
    const content = await fs.readFile(path.join(articlesDir, file), 'utf-8');
    const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n\n/, '');
    const paras = withoutFrontmatter.split(/\n\n+/).filter(p => {
      const words = p.split(/\s+/).length;
      return words >= 30 && words <= 150; // Good paragraph length
    });
    
    paragraphs.push(...paras.slice(0, 3));
    
    if (paragraphs.length >= count) break;
  }
  
  return paragraphs.slice(0, count);
}

function generateLlmGuide(
  writerName: string,
  metadata: any,
  vocab: VocabularyAnalysis,
  sentence: SentenceAnalysis,
  voice: VoiceMarkers,
  paragraph: ParagraphAnalysis | null,
  punctuation: PunctuationAnalysis | null,
  examples: string[]
): string {
  const totalCurrency = vocab.currencyPreference.gbp + vocab.currencyPreference.eur + vocab.currencyPreference.usd;
  const gbpPct = totalCurrency > 0 ? Math.round((vocab.currencyPreference.gbp / totalCurrency) * 100) : 0;
  const eurPct = totalCurrency > 0 ? Math.round((vocab.currencyPreference.eur / totalCurrency) * 100) : 0;
  const usdPct = totalCurrency > 0 ? Math.round((vocab.currencyPreference.usd / totalCurrency) * 100) : 0;
  
  return `# Statistical Voice Model: ${writerName}

## Corpus Statistics
- Articles analyzed: ${metadata.statistics.total_articles}
- Total words: ${metadata.statistics.total_words.toLocaleString()}
- Vocabulary richness: ${vocab.uniqueWords.toLocaleString()} unique words (${(vocab.vocabularyRichness * 100).toFixed(1)}%)
- Date range: ${metadata.articles[0]?.date || 'unknown'} to ${metadata.articles[metadata.articles.length - 1]?.date || 'unknown'}

## Vocabulary Embeddings

### Top Personal Markers (${voice.firstPerson.frequency.toFixed(1)} per 100 words)
${voice.firstPerson.examples.slice(0, 15).map(e => `- ${e.phrase}: ${e.count} uses`).join('\n')}

### Top Technical Terms
${vocab.technicalTerms.slice(0, 20).map(t => `- ${t.word}: ${t.count} uses`).join('\n')}

### Regional Markers
**British English:** ${vocab.britishMarkers.length > 0 ? vocab.britishMarkers.map(m => `${m.word} (${m.count})`).join(', ') : 'None detected'}
**American English:** ${vocab.americanMarkers.length > 0 ? vocab.americanMarkers.map(m => `${m.word} (${m.count})`).join(', ') : 'None detected'}

### Currency Preference
- £ (GBP): ${gbpPct}%
- € (EUR): ${eurPct}%
- $ (USD): ${usdPct}%

## Sentence DNA

### Length Distribution
- Mean: ${sentence.length.mean.toFixed(1)} words
- Median: ${sentence.length.median.toFixed(1)} words
- Std Dev: ±${sentence.length.stdDev.toFixed(1)} words

### Complexity Mix
- Simple sentences: ${sentence.complexity.simple.toFixed(1)}%
- Compound sentences: ${sentence.complexity.compound.toFixed(1)}%
- Complex sentences: ${sentence.complexity.complex.toFixed(1)}%

### Preferred Sentence Starters
${sentence.starters.slice(0, 10).map(s => `- "${s.word}": ${s.percentage.toFixed(1)}%`).join('\n')}

${punctuation ? `
## Punctuation Fingerprint
- Comma density: ${punctuation.commaDensity.toFixed(1)} per sentence
- Dash preference: Hyphen (-) ${punctuation.dashTypes.hyphen}, En-dash (–) ${punctuation.dashTypes.enDash}, Em-dash (—) ${punctuation.dashTypes.emDash}
- Exclamation marks: ${punctuation.exclamationFrequency.toFixed(1)} per 1000 words
- Ellipsis: ${punctuation.ellipsisFrequency.toFixed(1)} per 1000 words
- Quotation style: ${punctuation.quotationStyle}
` : ''}

${paragraph ? `
## Paragraph Rhythm Pattern
- Mean sentences per paragraph: ${paragraph.sentencesPerParagraph.mean.toFixed(1)} (±${paragraph.sentencesPerParagraph.stdDev.toFixed(1)})
- Symmetry score: ${paragraph.symmetryScore.toFixed(2)} (${paragraph.symmetryScore < 0.3 ? 'HIGHLY VARIABLE - natural' : paragraph.symmetryScore < 0.6 ? 'moderate variation' : 'consistent/symmetric'})

### Opening Patterns
${paragraph.openingPatterns.map(p => `- ${p.type}: ${p.percentage.toFixed(1)}%`).join('\n')}
` : ''}

## Voice Signature

### First Person Usage (${voice.firstPerson.frequency.toFixed(1)} per 100 words)
${voice.firstPerson.frequency > 2 ? '**HIGH - Strong personal authority**' : voice.firstPerson.frequency > 1 ? '**MODERATE - Present but not dominant**' : '**LOW - Impersonal style**'}

### Hedging Language (${voice.hedgingLanguage.frequency.toFixed(2)} per 100 words)
${voice.hedgingLanguage.frequency < 0.5 ? '**LOW - Confident, direct**' : voice.hedgingLanguage.frequency < 1 ? '**MODERATE**' : '**HIGH - Cautious, uncertain**'}

### Conversational Markers
${voice.conversationalMarkers.length > 0 ? voice.conversationalMarkers.map(m => `- ${m.word}: ${m.count}`).join('\n') : 'None detected - formal style'}

## Anti-Patterns (NEVER Use)

### AI Clichés ${voice.aiCliches.length > 0 ? '❌ DETECTED - REMOVE THESE' : '✓ Clean'}
${voice.aiCliches.length > 0 ? voice.aiCliches.map(c => `- "${c.phrase}": ${c.count} uses`).join('\n') : '- None detected'}

### Marketing Speak ${voice.marketingSpeak.length > 0 ? '❌ DETECTED - REMOVE THESE' : '✓ Clean'}
${voice.marketingSpeak.length > 0 ? voice.marketingSpeak.map(m => `- "${m.phrase}": ${m.count} uses`).join('\n') : '- None detected'}

## Example Corpus

These paragraphs demonstrate the writer's authentic voice:

${examples.map((para, i) => `### Example ${i + 1}
${para}

`).join('\n')}

---

## How to Use This Guide

**For LLMs writing in this voice:**

1. Match the first-person frequency (${voice.firstPerson.frequency.toFixed(1)} per 100 words)
2. Use technical terms naturally: ${vocab.technicalTerms.slice(0, 5).map(t => t.word).join(', ')}
3. Vary sentence length: ${sentence.length.mean.toFixed(0)}±${sentence.length.stdDev.toFixed(0)} words per sentence
4. ${vocab.britishMarkers.length > 0 ? 'Use British spelling and "whilst"' : 'Standard spelling'}
5. ${voice.hedgingLanguage.frequency < 0.5 ? 'Be confident and direct - avoid hedging' : 'Use moderate hedging'}
6. Avoid: ${voice.aiCliches.length > 0 ? voice.aiCliches.slice(0, 3).map(c => c.phrase).join(', ') : 'AI clichés like "dive into", "leverage"'}
7. Study the example paragraphs above for authentic patterns

**Success metric:** Generated text should be statistically indistinguishable from corpus.
`;
}

function generateHumanGuide(
  writerName: string,
  metadata: any,
  vocab: VocabularyAnalysis,
  sentence: SentenceAnalysis,
  voice: VoiceMarkers,
  paragraph: ParagraphAnalysis | null,
  punctuation: PunctuationAnalysis | null
): string {
  return `# Tone of Voice Guide: ${writerName}

## Overview

This guide describes ${writerName}'s writing style based on analysis of ${metadata.statistics.total_articles} published articles (${metadata.statistics.total_words.toLocaleString()} words).

## Voice Characteristics

### Personal Authority
- Uses first person frequently (${voice.firstPerson.frequency.toFixed(1)}% of words)
- Establishes credibility through ownership statements
- Shares personal experience and testing

### Confidence Level
${voice.hedgingLanguage.frequency < 0.5 ? 
  '- Direct and confident - rarely hedges with "perhaps" or "might"' : 
  '- Moderate confidence with some hedging language'}

### Regional Style
${vocab.britishMarkers.length > 0 ? 
  `- **British English** (uses "whilst", British spellings)` : 
  '- Standard English'}

### Technical Depth
- Uses domain-specific terms naturally
- Top technical vocabulary: ${vocab.technicalTerms.slice(0, 10).map(t => t.word).join(', ')}

## Writing Patterns

### Sentence Structure
- Average length: ${sentence.length.mean.toFixed(0)} words
- Mix: ${sentence.complexity.simple.toFixed(0)}% simple, ${sentence.complexity.compound.toFixed(0)}% compound, ${sentence.complexity.complex.toFixed(0)}% complex
- Common starters: ${sentence.starters.slice(0, 5).map(s => s.word).join(', ')}

${paragraph ? `
### Paragraph Style
- Average ${paragraph.sentencesPerParagraph.mean.toFixed(1)} sentences per paragraph
- ${paragraph.symmetryScore < 0.3 ? 'Highly variable lengths (natural, asymmetric)' : 'Relatively consistent lengths'}
` : ''}

## What to Avoid
${voice.aiCliches.length > 0 || voice.marketingSpeak.length > 0 ? `
- AI clichés: ${voice.aiCliches.map(c => c.phrase).join(', ')}
- Marketing speak: ${voice.marketingSpeak.map(m => m.phrase).join(', ')}
` : '- Writing is clean - no AI or marketing clichés detected'}

## Quick Checklist

- [ ] Use first person to establish authority
- [ ] ${vocab.britishMarkers.length > 0 ? 'Use British spelling (whilst, colour, etc.)' : 'Standard spelling'}
- [ ] Vary sentence length (${sentence.length.mean.toFixed(0)}±${sentence.length.stdDev.toFixed(0)} words)
- [ ] Include technical terms naturally
- [ ] ${voice.hedgingLanguage.frequency < 0.5 ? 'Be direct and confident' : 'Use moderate hedging'}
- [ ] Avoid AI clichés and marketing language
`;
}
