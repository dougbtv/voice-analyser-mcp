/**
 * Enhanced LLM Guide Generator v4.1
 * 
 * SOUL-FIRST FORMAT: Examples and personality before statistics
 * 
 * Structure:
 * - Part 1: The Soul of the Voice (identity, positioning, emotional calibration)
 * - Part 2: Voice in Action (examples before stats)
 * - Part 3: Anti-Mechanical Writing Rules
 * - Part 4: The Forbidden List
 * - Part 5: Domain Patterns
 * - Part 6: Statistical Validation (numbers that VALIDATE, don't CREATE)
 * - Appendices: Detailed examples, corpus data
 */

import fs from 'fs/promises';
import path from 'path';
import type { VocabularyAnalysis } from '../analyzers/vocabulary.js';
import type { SentenceAnalysis } from '../analyzers/sentence.js';
import type { VoiceMarkers } from '../analyzers/voice-markers.js';
import type { ParagraphAnalysis } from '../analyzers/paragraph.js';
import type { PunctuationAnalysis } from '../analyzers/punctuation.js';
import type { FunctionWordAnalysis } from '../analyzers/function-words.js';
import type { CharNGramAnalysis } from '../analyzers/char-ngrams.js';
import type { WordNGramAnalysis } from '../analyzers/word-ngrams.js';
import type { POSNGramAnalysis } from '../analyzers/pos-ngrams.js';
import type { AntiMechanicalAnalysis } from '../analyzers/anti-mechanical.js';
import type { InformationDensityAnalysis } from '../analyzers/information-density.js';

export interface EnhancedGuideParams {
  corpus_name: string;
  output_format?: 'llm' | 'human' | 'both';
}

export interface EnhancedGuideResult {
  success: boolean;
  llm_guide_path?: string;
  human_guide_path?: string;
}

export async function generateEnhancedGuide(params: EnhancedGuideParams): Promise<EnhancedGuideResult> {
  const { corpus_name, output_format = 'both' } = params;
  
  const corpusDir = path.join(process.cwd(), 'corpus', corpus_name);
  const analysisDir = path.join(corpusDir, 'analysis');
  const templatesDir = path.join(process.cwd(), 'templates');
  const articlesDir = path.join(corpusDir, 'articles');
  
  await fs.mkdir(templatesDir, { recursive: true });
  
  // Load all analysis files
  const vocab = await loadJSON<VocabularyAnalysis>(analysisDir, 'vocabulary.json', false);
  const sentence = await loadJSON<SentenceAnalysis>(analysisDir, 'sentence.json', false);
  const voice = await loadJSON<VoiceMarkers>(analysisDir, 'voice.json', false);
  const paragraph = await loadJSON<ParagraphAnalysis>(analysisDir, 'paragraph.json', true);
  const punctuation = await loadJSON<PunctuationAnalysis>(analysisDir, 'punctuation.json', true);
  const functionWords = await loadJSON<FunctionWordAnalysis>(analysisDir, 'function-words.json', true);
  const charNGrams = await loadJSON<CharNGramAnalysis>(analysisDir, 'char-ngrams.json', true);
  const wordNGrams = await loadJSON<WordNGramAnalysis>(analysisDir, 'word-ngrams.json', true);
  const posNGrams = await loadJSON<POSNGramAnalysis>(analysisDir, 'pos-ngrams.json', true);
  const antiMechanical = await loadJSON<AntiMechanicalAnalysis>(analysisDir, 'anti-mechanical.json', true);
  const informationDensity = await loadJSON<InformationDensityAnalysis>(analysisDir, 'information-density.json', true);
  
  const metadata = JSON.parse(
    await fs.readFile(path.join(corpusDir, 'corpus.json'), 'utf-8')
  );
  
  // Extract example paragraphs
  const examples = await extractExampleParagraphs(articlesDir, 10);
  
  const result: EnhancedGuideResult = { success: true };
  
  // Ensure required analyses exist
  if (!vocab || !sentence || !voice) {
    throw new Error('Missing required analysis files (vocabulary, sentence, voice)');
  }
  
  if (output_format === 'llm' || output_format === 'both') {
    const llmGuide = generateSoulFirstLLMGuide(
      corpus_name,
      metadata,
      vocab,
      sentence,
      voice,
      paragraph,
      punctuation,
      functionWords,
      charNGrams,
      wordNGrams,
      posNGrams,
      antiMechanical,
      informationDensity,
      examples
    );
    
    const llmPath = path.join(templatesDir, `writing_style_${corpus_name}.md`);
    await fs.writeFile(llmPath, llmGuide, 'utf-8');
    result.llm_guide_path = llmPath;
  }
  
  if (output_format === 'human' || output_format === 'both') {
    const humanGuide = generateHumanGuide(
      corpus_name,
      metadata,
      vocab,
      sentence,
      voice,
      paragraph,
      punctuation,
      functionWords,
      antiMechanical
    );
    
    const humanPath = path.join(templatesDir, `tov_${corpus_name}_human.md`);
    await fs.writeFile(humanPath, humanGuide, 'utf-8');
    result.human_guide_path = humanPath;
  }
  
  return result;
}

async function loadJSON<T>(dir: string, filename: string, optional: boolean = false): Promise<T | null> {
  try {
    const content = await fs.readFile(path.join(dir, filename), 'utf-8');
    return JSON.parse(content) as T;
  } catch (e) {
    if (optional) return null;
    throw e;
  }
}

async function extractExampleParagraphs(articlesDir: string, count: number): Promise<string[]> {
  const files = await fs.readdir(articlesDir);
  const markdownFiles = files.filter(f => f.endsWith('.md')).slice(0, 8);
  
  const paragraphs: string[] = [];
  
  for (const file of markdownFiles) {
    const content = await fs.readFile(path.join(articlesDir, file), 'utf-8');
    const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n\n/, '');
    const paras = withoutFrontmatter.split(/\n\n+/).filter(p => {
      const words = p.split(/\s+/).length;
      return words >= 30 && words <= 150 && p.trim().length > 0 && !p.startsWith('#');
    });
    
    paragraphs.push(...paras.slice(0, 3));
    
    if (paragraphs.length >= count) break;
  }
  
  return paragraphs.slice(0, count);
}

/**
 * Generate the soul-first LLM guide (v4.1 format)
 */
function generateSoulFirstLLMGuide(
  writerName: string,
  metadata: any,
  vocab: VocabularyAnalysis,
  sentence: SentenceAnalysis,
  voice: VoiceMarkers,
  paragraph: ParagraphAnalysis | null,
  punctuation: PunctuationAnalysis | null,
  functionWords: FunctionWordAnalysis | null,
  charNGrams: CharNGramAnalysis | null,
  wordNGrams: WordNGramAnalysis | null,
  posNGrams: POSNGramAnalysis | null,
  antiMechanical: AntiMechanicalAnalysis | null,
  informationDensity: InformationDensityAnalysis | null,
  examples: string[]
): string {
  const lines: string[] = [];
  
  // ============================================================
  // HEADER
  // ============================================================
  lines.push(`# ${formatWriterName(writerName)} Writing Style Guide v4.1`);
  lines.push('*The Authentic Voice Manual: Examples First, Statistics Later*');
  lines.push('');
  lines.push('**Philosophy:** This guide teaches Claude to write like this author - not by matching numbers, but by understanding the *human* behind the patterns. Statistics validate; personality drives.');
  lines.push('');
  lines.push('**Golden Rule:** Read the examples. Feel the voice. Then check the numbers.');
  lines.push('');
  
  // ============================================================
  // PART ONE: THE SOUL OF THE VOICE
  // ============================================================
  lines.push('---');
  lines.push('');
  lines.push('## PART ONE: THE SOUL OF THE VOICE');
  lines.push('');
  
  // Identity section
  lines.push('### Who Is This Writer?');
  lines.push('');
  lines.push('**The Core Identity:**');
  
  // Determine identity based on voice markers
  const hasSignatureHedging = voice.signatureHedging && voice.signatureHedging.length > 0;
  const hasCollegialPatterns = voice.collegialPatterns && voice.collegialPatterns.length > 0;
  const hasIdentityMarkers = voice.identityMarkers && (
    voice.identityMarkers.genuineInterest.length > 0 ||
    voice.identityMarkers.humbleHelper.length > 0 ||
    voice.identityMarkers.transparencyCommitment.length > 0
  );
  
  if (hasIdentityMarkers || hasSignatureHedging) {
    lines.push('> "An experienced friend who shares hard-won knowledge, including the mistakes made along the way."');
  } else {
    lines.push('> "A knowledgeable practitioner who explains complex topics with clarity and authority."');
  }
  lines.push('');
  
  lines.push('Not a guru on a mountain. Not a marketing department. This writer:');
  lines.push('');
  
  // Build characteristics from detected patterns
  const characteristics: string[] = [];
  
  if (voice.firstPerson.frequency > 0.3) {
    characteristics.push('- Uses first-person to establish genuine authority and personal experience');
  }
  if (hasSignatureHedging) {
    characteristics.push('- Hedges honestly when uncertain, but states facts confidently');
  }
  if (hasCollegialPatterns) {
    characteristics.push('- Treats readers as colleagues, normalising common shortcuts');
  }
  if (voice.conversationalMarkers.length > 3) {
    characteristics.push('- Writes conversationally with natural markers ("look", "well", "actually")');
  }
  if (vocab.britishMarkers.length > 0) {
    characteristics.push('- Uses British English throughout (spelling and vocabulary)');
  }
  if (voice.hedgingLanguage.frequency < 0.5) {
    characteristics.push('- Takes a direct, confident tone with minimal unnecessary hedging');
  }
  
  if (characteristics.length === 0) {
    characteristics.push('- Writes with technical authority');
    characteristics.push('- Balances expertise with accessibility');
  }
  
  for (const char of characteristics) {
    lines.push(char);
  }
  lines.push('');
  
  // Authentic enthusiasm test
  lines.push('### The Authentic Enthusiasm Test');
  lines.push('');
  lines.push('**Genuine interest sounds different from marketing speak:**');
  lines.push('');
  lines.push('| Wrong (Marketing) | Right (Authentic) |');
  lines.push('|-------------------|-------------------|');
  lines.push('| "I\'m passionate about..." | "I\'m very much into..." |');
  lines.push('| "This amazing tool..." | "This actually works..." |');
  lines.push('| "Revolutionary approach..." | "What I\'ve found is..." |');
  lines.push('| "Game-changing technology..." | "This solved the problem..." |');
  lines.push('');
  
  if (punctuation && punctuation.exclamationFrequency > 5) {
    lines.push(`This writer uses exclamation marks at ${punctuation.exclamationFrequency.toFixed(1)} per 1,000 words - showing measured enthusiasm, not hype.`);
  } else {
    lines.push('Enthusiasm is calibrated. Appreciate capability without performing amazement.');
  }
  lines.push('');
  
  // Collegial patterns
  if (hasCollegialPatterns || voice.certaintyMarkers.some(m => m.word === 'obviously')) {
    lines.push('### The "Obviously" Collegial Pattern');
    lines.push('');
    lines.push('One signature move: normalising the shortcuts everyone takes.');
    lines.push('');
    lines.push('**The Structure:**');
    lines.push('```');
    lines.push('[Acknowledge the shortcut everyone uses]');
    lines.push('↓');
    lines.push('"Obviously this is inevitable, we\'re all busy"');
    lines.push('↓');
    lines.push('[Validate them for taking it]');
    lines.push('↓');
    lines.push('"But there\'s more to it than..."');
    lines.push('↓');
    lines.push('[Gently guide toward deeper understanding]');
    lines.push('```');
    lines.push('');
    lines.push('**Why This Works:** Meet readers where they are. No judgment for taking shortcuts. Then elevate them.');
    lines.push('');
  }
  
  // ============================================================
  // PART TWO: VOICE IN ACTION
  // ============================================================
  lines.push('---');
  lines.push('');
  lines.push('## PART TWO: VOICE IN ACTION');
  lines.push('');
  
  // Opening patterns with examples
  lines.push('### Opening Patterns');
  lines.push('');
  lines.push('**Never start with:**');
  lines.push('- "In today\'s digital landscape..."');
  lines.push('- "Let me tell you about..."');
  lines.push('- "Welcome to this comprehensive guide..."');
  lines.push('- "Are you looking for..."');
  lines.push('');
  
  lines.push('**Start with:**');
  lines.push('');
  
  // Show actual examples from corpus
  if (examples.length > 0) {
    const openingExamples = examples.slice(0, 2);
    for (let i = 0; i < openingExamples.length; i++) {
      const firstSentence = openingExamples[i].split(/[.!?]/)[0];
      if (firstSentence && firstSentence.length > 20 && firstSentence.length < 200) {
        lines.push(`**Example ${i + 1}:** "${firstSentence.trim()}..."`);
        lines.push('');
      }
    }
  }
  
  // Opening pattern types detected
  if (voice.openingPatterns) {
    lines.push('**Detected opening styles in corpus:**');
    if (voice.openingPatterns.personalContext > 0) {
      lines.push(`- Personal context openings: ${voice.openingPatterns.personalContext}`);
    }
    if (voice.openingPatterns.observation > 0) {
      lines.push(`- Observation openings: ${voice.openingPatterns.observation}`);
    }
    if (voice.openingPatterns.question > 0) {
      lines.push(`- Question openings: ${voice.openingPatterns.question}`);
    }
    if (voice.openingPatterns.directProblem > 0) {
      lines.push(`- Direct problem openings: ${voice.openingPatterns.directProblem}`);
    }
    lines.push('');
  }
  
  // Equipment specificity
  if (voice.equipmentSpecificity && 
      (voice.equipmentSpecificity.specific.length > 0 || voice.equipmentSpecificity.generic.length > 0)) {
    lines.push('### Equipment & Product Specificity');
    lines.push('');
    lines.push('**This is a major authenticity marker.**');
    lines.push('');
    
    if (voice.equipmentSpecificity.specific.length > 0) {
      lines.push('**Right (specific, personal):**');
      for (const eq of voice.equipmentSpecificity.specific.slice(0, 5)) {
        lines.push(`- ✓ "${eq.phrase}"`);
      }
      lines.push('');
    }
    
    if (voice.equipmentSpecificity.generic.length > 0) {
      lines.push('**Wrong (generic):**');
      for (const eq of voice.equipmentSpecificity.generic.slice(0, 5)) {
        lines.push(`- ❌ "${eq.phrase}"`);
      }
      lines.push('');
    }
    
    lines.push('**Why:** Generic references signal AI-generated or marketing copy. Specific names with "my" establish real testing experience.');
    lines.push('');
  }
  
  // Hedging & Confidence
  lines.push('### Hedging & Confidence Balance');
  lines.push('');
  lines.push(`**Hedging frequency:** ${voice.hedgingLanguage.frequency.toFixed(2)} per 100 words`);
  
  if (voice.hedgingLanguage.frequency < 0.5) {
    lines.push('');
    lines.push('**Style:** Direct and confident. Hedging is LOW - use sparingly.');
  } else if (voice.hedgingLanguage.frequency < 1.0) {
    lines.push('');
    lines.push('**Style:** Balanced confidence with honest uncertainty.');
  } else {
    lines.push('');
    lines.push('**Style:** Cautious and measured, frequent hedging.');
  }
  lines.push('');
  
  // Signature hedging phrases
  if (hasSignatureHedging) {
    lines.push('**Signature hedging phrases (use these):**');
    for (const h of voice.signatureHedging!.slice(0, 8)) {
      lines.push(`- "${h.phrase}" (${h.count} uses)`);
    }
    lines.push('');
  }
  
  // Standard hedging
  if (voice.hedgingLanguage.examples.length > 0) {
    lines.push('**Standard hedging words:**');
    lines.push(voice.hedgingLanguage.examples.slice(0, 8).map(h => h.word).join(', '));
    lines.push('');
  }
  
  // Conversational markers
  if (voice.conversationalMarkers.length > 0) {
    lines.push('### Conversational Markers');
    lines.push('');
    lines.push('**Use these for natural flow:**');
    lines.push('');
    for (const marker of voice.conversationalMarkers.slice(0, 8)) {
      lines.push(`- **"${marker.word}"** (${marker.count} uses)`);
    }
    lines.push('');
  }
  
  // First-person usage
  lines.push('### First-Person Authority');
  lines.push('');
  lines.push(`**Frequency:** ${voice.firstPerson.frequency.toFixed(2)} per 100 words`);
  lines.push('');
  
  if (wordNGrams && wordNGrams.categoryPatterns.firstPerson.length > 0) {
    lines.push('**Preferred first-person phrases:**');
    for (const p of wordNGrams.categoryPatterns.firstPerson.slice(0, 10)) {
      lines.push(`- "${p.ngram}" (${p.count} uses)`);
    }
    lines.push('');
  }
  
  lines.push('**Distribution matters:** Don\'t cluster "I" at sentence starts. Integrate naturally throughout.');
  lines.push('');
  
  // ============================================================
  // PART 2.5: INFORMATION DENSITY PROFILE (NEW)
  // ============================================================
  if (informationDensity) {
    lines.push('---');
    lines.push('');
    lines.push('## PART 2.5: INFORMATION DENSITY PROFILE');
    lines.push('');
    lines.push('*Based on Dejan AI research (Dec 2025) on how AI systems extract content*');
    lines.push('');
    lines.push('> **Note:** This describes natural patterns. It does NOT prescribe artificial optimisation.');
    lines.push('> Authentic voice should always take priority over extraction metrics.');
    lines.push('');
    
    // Natural article length
    lines.push('### Natural Content Length');
    lines.push('');
    lines.push(`**Average article length:** ${informationDensity.corpusProfile.averageArticleLength.toLocaleString()} words`);
    lines.push('');
    
    // Coverage prediction based on Dejan research
    lines.push(`**Predicted AI coverage:** ${informationDensity.extractabilityProfile.estimatedCoverage}%`);
    lines.push('');
    lines.push('*(Based on research: pages <1K words get ~61% coverage, 1-2K get ~35%, 2-3K get ~22%, 3K+ get ~13%)*');
    lines.push('');
    
    // Opening style
    lines.push('### Opening Style Pattern');
    lines.push('');
    lines.push(`**Natural tendency:** ${informationDensity.openingPatterns.naturalTendency}`);
    lines.push('');
    lines.push(`- First 100 words: ${informationDensity.openingPatterns.first100Words.typicalClaimCount} claims, ${informationDensity.openingPatterns.first100Words.typicalEntityCount} entities`);
    lines.push(`- First 300 words: ${informationDensity.openingPatterns.first300Words.typicalClaimCount} claims, ${informationDensity.openingPatterns.first300Words.typicalEntityCount} entities`);
    lines.push(`- Opening style: **${informationDensity.openingPatterns.first100Words.style}**`);
    lines.push('');
    
    // Self-containment
    lines.push('### Self-Containment Profile');
    lines.push('');
    lines.push(`**Standalone-ready sentences:** ${informationDensity.selfContainment.standaloneReadyPercentage}%`);
    lines.push(`**Pronoun reliance:** ${informationDensity.selfContainment.pronounReliance}`);
    lines.push('');
    
    if (informationDensity.selfContainment.danglingPatterns.length > 0) {
      lines.push('**Natural reference patterns:**');
      for (const p of informationDensity.selfContainment.danglingPatterns.slice(0, 3)) {
        lines.push(`- ${p.pattern}: ${p.frequency} occurrences`);
      }
      lines.push('');
    }
    
    // Claim density
    lines.push('### Claim Density Pattern');
    lines.push('');
    lines.push(`**Overall density:** ${informationDensity.claimDensity.overall} claims per 100 words`);
    lines.push('');
    lines.push('**Distribution by position:**');
    lines.push(`- Opening (first 20%): ${informationDensity.claimDensity.byPosition.opening}`);
    lines.push(`- Middle (60%): ${informationDensity.claimDensity.byPosition.middle}`);
    lines.push(`- Closing (last 20%): ${informationDensity.claimDensity.byPosition.closing}`);
    lines.push('');
    lines.push(`**Pattern:** ${informationDensity.claimDensity.distributionNote}`);
    lines.push('');
    
    // Natural strengths
    if (informationDensity.extractabilityProfile.strengths.length > 0) {
      lines.push('### Natural Extractability Strengths');
      lines.push('');
      for (const strength of informationDensity.extractabilityProfile.strengths) {
        lines.push(`- ✓ ${strength}`);
      }
      lines.push('');
    }
    
    // Style characteristics (not criticisms)
    if (informationDensity.extractabilityProfile.characteristics.length > 0) {
      lines.push('### Style Characteristics');
      lines.push('');
      lines.push('*These are observations, not recommendations to change:*');
      lines.push('');
      for (const char of informationDensity.extractabilityProfile.characteristics) {
        lines.push(`- ${char}`);
      }
      lines.push('');
    }
    
    lines.push(`> ${informationDensity.extractabilityProfile.note}`);
    lines.push('');
  }
  
  // ============================================================
  // PART THREE: ANTI-MECHANICAL WRITING RULES
  // ============================================================
  lines.push('---');
  lines.push('');
  lines.push('## PART THREE: ANTI-MECHANICAL WRITING RULES');
  lines.push('');
  
  lines.push('### The Mechanical Voice Problem');
  lines.push('');
  lines.push('AI-assisted writing falls into these traps:');
  lines.push('');
  lines.push('1. **Uniform sentence length** - every sentence 15-20 words');
  lines.push('2. **Predictable paragraph rhythm** - always 3-4 sentences');
  lines.push('3. **Missing personality markers** - no "look", "well", "actually"');
  lines.push('4. **Generic references** - "the product" not "my Simucube 2 Pro"');
  lines.push('5. **Perfect narratives** - no mistakes admitted');
  lines.push('6. **Symmetrical structure** - introduction mirrors conclusion');
  lines.push('');
  
  lines.push('### Breaking Mechanical Patterns');
  lines.push('');
  
  // Sentence variation requirements
  lines.push('**Sentence Length Variation (CRITICAL):**');
  lines.push('');
  lines.push(`Target: ${sentence.length.mean.toFixed(1)} words average ±${sentence.length.stdDev.toFixed(1)} variance`);
  lines.push('');
  lines.push('This means:');
  lines.push('- Many sentences are 5-8 words (punchy)');
  lines.push('- Some are 10-15 words (standard)');
  lines.push('- Some are 20-30 words (complex explanation)');
  lines.push('- Occasional sentences hit 35+ words (deep technical point)');
  lines.push('');
  
  if (antiMechanical) {
    lines.push(`**Corpus naturalness score:** ${antiMechanical.naturalness.totalScore}/100 (${antiMechanical.naturalness.interpretation.replace('_', ' ')})`);
    lines.push('');
    lines.push('**Sentence distribution in corpus:**');
    lines.push(`- Short (1-8 words): ${antiMechanical.sentenceLengthVariation.distribution.short}`);
    lines.push(`- Medium (9-20 words): ${antiMechanical.sentenceLengthVariation.distribution.medium}`);
    lines.push(`- Long (21-40 words): ${antiMechanical.sentenceLengthVariation.distribution.long}`);
    lines.push(`- Very long (40+): ${antiMechanical.sentenceLengthVariation.distribution.veryLong}`);
    lines.push('');
  }
  
  lines.push('**Test:** Read your paragraph aloud. If every sentence has the same rhythm, it\'s mechanical.');
  lines.push('');
  
  // Paragraph asymmetry
  if (paragraph) {
    lines.push('### Paragraph Asymmetry');
    lines.push('');
    lines.push(`**Target:** ${paragraph.sentencesPerParagraph.mean.toFixed(1)} sentences per paragraph ±${paragraph.sentencesPerParagraph.stdDev.toFixed(1)} variance`);
    lines.push('');
    lines.push('Your paragraphs should be HIGHLY VARIABLE:');
    lines.push('- Single-sentence paragraphs for emphasis');
    lines.push('- 2-3 sentence paragraphs for standard points');
    lines.push('- 4+ sentence paragraphs for complex explanations');
    lines.push('');
    lines.push('**Never:** Write 5 paragraphs of exactly 3 sentences each.');
    lines.push('');
  }
  
  // ============================================================
  // PART FOUR: THE FORBIDDEN LIST
  // ============================================================
  lines.push('---');
  lines.push('');
  lines.push('## PART FOUR: THE FORBIDDEN LIST');
  lines.push('');
  
  lines.push('### Zero Tolerance AI Clichés');
  lines.push('');
  
  // Show detected AI clichés first
  if (voice.aiCliches.length > 0) {
    lines.push('**❌ DETECTED IN CORPUS - MUST ELIMINATE:**');
    lines.push('');
    for (const cliche of voice.aiCliches) {
      lines.push(`- "${cliche.phrase}" (${cliche.count} uses) → REMOVE`);
    }
    lines.push('');
  }
  
  lines.push('**Complete forbidden list with replacements:**');
  lines.push('');
  lines.push('| BANNED | REPLACEMENT |');
  lines.push('|--------|-------------|');
  lines.push('| delve / delving | explore, examine, look at |');
  lines.push('| leverage / leveraging | use, apply |');
  lines.push('| unlock / unlocking | enable, access, discover |');
  lines.push('| seamless / seamlessly | smooth, easy, naturally |');
  lines.push('| robust | strong, solid, reliable |');
  lines.push('| utilize / utilization | use |');
  lines.push('| harness / harnessing | use, apply |');
  lines.push('| cutting-edge | modern, latest, current |');
  lines.push('| game-changer | significant, important |');
  lines.push('| revolutionize | change, improve |');
  lines.push('| in today\'s [landscape/world] | now, currently |');
  lines.push('| rapidly evolving | changing, developing |');
  lines.push('| dive into / dive deep | look at, explore, examine |');
  lines.push('| it\'s worth noting | (just state it) |');
  lines.push('| at the end of the day | ultimately, in practice |');
  lines.push('');
  
  // Marketing speak
  if (voice.marketingSpeak.length > 0) {
    lines.push('**Marketing speak detected:**');
    for (const phrase of voice.marketingSpeak) {
      lines.push(`- "${phrase.phrase}" (${phrase.count} uses) → REMOVE`);
    }
    lines.push('');
  }
  
  lines.push('**Detection Test:** If a phrase sounds like it could appear in a LinkedIn post or corporate press release, rewrite it.');
  lines.push('');
  
  // British English
  if (vocab.britishMarkers.length > 0) {
    lines.push('### British English (MANDATORY)');
    lines.push('');
    lines.push('**Detected British markers in corpus:**');
    for (const marker of vocab.britishMarkers) {
      lines.push(`- ${marker.word} (${marker.count} uses)`);
    }
    lines.push('');
    lines.push('**Spelling requirements:**');
    lines.push('');
    lines.push('| American ❌ | British ✓ |');
    lines.push('|------------|-----------|');
    lines.push('| color | colour |');
    lines.push('| optimize | optimise |');
    lines.push('| center | centre |');
    lines.push('| analyze | analyse |');
    lines.push('| behavior | behaviour |');
    lines.push('| favorite | favourite |');
    lines.push('');
  }
  
  // ============================================================
  // PART FIVE: DOMAIN PATTERNS
  // ============================================================
  lines.push('---');
  lines.push('');
  lines.push('## PART FIVE: DOMAIN VOCABULARY');
  lines.push('');
  
  lines.push('### Core Technical Terms');
  lines.push('');
  lines.push('Use these domain terms naturally and frequently:');
  lines.push('');
  
  const topTerms = vocab.technicalTerms.slice(0, 20);
  for (const term of topTerms) {
    lines.push(`- **${term.word}** (${term.count} uses)`);
  }
  lines.push('');
  
  // Technical phrases
  if (wordNGrams && wordNGrams.categoryPatterns.technical.length > 0) {
    lines.push('### Technical Phrase Patterns');
    lines.push('');
    for (const p of wordNGrams.categoryPatterns.technical.slice(0, 12)) {
      lines.push(`- "${p.ngram}" (${p.count} times)`);
    }
    lines.push('');
  }
  
  // Transitional phrases
  if (wordNGrams && wordNGrams.categoryPatterns.transitional.length > 0) {
    lines.push('### Transitional Phrases');
    lines.push('');
    lines.push('Use these connectives for natural flow:');
    for (const p of wordNGrams.categoryPatterns.transitional) {
      lines.push(`- "${p.ngram}" (${p.count} times)`);
    }
    lines.push('');
  }
  
  // ============================================================
  // PART SIX: STATISTICAL VALIDATION
  // ============================================================
  lines.push('---');
  lines.push('');
  lines.push('## PART SIX: STATISTICAL VALIDATION');
  lines.push('');
  lines.push('*These numbers VALIDATE the voice. They don\'t CREATE it.*');
  lines.push('');
  
  // Core metrics table
  lines.push('### Core Metrics');
  lines.push('');
  lines.push('| Metric | Value | Notes |');
  lines.push('|--------|-------|-------|');
  lines.push(`| Sentence length | ${sentence.length.mean.toFixed(1)} ±${sentence.length.stdDev.toFixed(1)} | High variance = natural |`);
  if (paragraph) {
    lines.push(`| Sentences/paragraph | ${paragraph.sentencesPerParagraph.mean.toFixed(1)} | Variable, not uniform |`);
  }
  lines.push(`| First-person | ${voice.firstPerson.frequency.toFixed(2)}/100 words | Distributed, not clustered |`);
  lines.push(`| Hedging | ${voice.hedgingLanguage.frequency.toFixed(2)}/100 words | ${voice.hedgingLanguage.frequency < 0.5 ? 'Confident' : 'Measured'} |`);
  if (punctuation) {
    lines.push(`| Exclamation marks | ${punctuation.exclamationFrequency.toFixed(1)}/1000 words | Enthusiasm level |`);
  }
  lines.push(`| Vocabulary richness | ${(vocab.vocabularyRichness * 100).toFixed(1)}% | Unique words |`);
  lines.push('');
  
  // Function word fingerprint
  if (functionWords) {
    lines.push('### Function Word Fingerprint');
    lines.push('');
    
    if (functionWords.distinctive.length > 0) {
      lines.push('**Over-used (signature markers):**');
      for (const fw of functionWords.distinctive.slice(0, 8)) {
        const zData = functionWords.zScores[fw.word];
        if (zData) {
          lines.push(`- **${fw.word}**: ${fw.frequency.toFixed(1)}/1000 words (z = ${zData.zScore.toFixed(2)})`);
        }
      }
      lines.push('');
    }
    
    if (functionWords.avoided.length > 0) {
      lines.push('**Under-used (patterns to maintain):**');
      for (const fw of functionWords.avoided.slice(0, 8)) {
        const zData = functionWords.zScores[fw.word];
        if (zData) {
          lines.push(`- **${fw.word}**: ${fw.frequency.toFixed(1)}/1000 words (z = ${zData.zScore.toFixed(2)})`);
        }
      }
      lines.push('');
    }
  }
  
  // Punctuation patterns
  if (punctuation) {
    lines.push('### Punctuation Patterns');
    lines.push('');
    lines.push(`- Comma density: ${punctuation.commaDensity.toFixed(1)} per sentence`);
    lines.push(`- Dash preference: ${punctuation.dashTypes.emDash > punctuation.dashTypes.hyphen ? 'Em-dash (—)' : 'Hyphen (-)'}`);
    lines.push(`- Quotation style: ${punctuation.quotationStyle}`);
    lines.push('');
  }
  
  // ============================================================
  // APPENDIX A: EXAMPLES
  // ============================================================
  lines.push('---');
  lines.push('');
  lines.push('## APPENDIX A: AUTHENTIC EXAMPLES');
  lines.push('');
  lines.push('### ✅ Good Examples from Corpus');
  lines.push('');
  
  for (let i = 0; i < Math.min(4, examples.length); i++) {
    lines.push(`**Example ${i + 1}:**`);
    lines.push('```');
    lines.push(examples[i].substring(0, 400));
    lines.push('```');
    lines.push('');
    
    // Add pattern analysis
    const annotations = analyzeExample(examples[i], wordNGrams, vocab, voice);
    if (annotations.length > 0) {
      lines.push('**Pattern Analysis:**');
      for (const ann of annotations) {
        lines.push(`- ✅ ${ann}`);
      }
      lines.push('');
    }
  }
  
  // Bad examples
  lines.push('### ❌ Bad Examples (What to Avoid)');
  lines.push('');
  
  lines.push('**Bad Example 1: AI Cliché Overload**');
  lines.push('```');
  lines.push('In today\'s rapidly evolving landscape, it is essential to leverage cutting-edge technology to unlock the full potential of your experience. By diving deep into the robust ecosystem, you can seamlessly optimize your setup.');
  lines.push('```');
  lines.push('**Issues:** 8+ AI clichés, zero first-person, passive voice, marketing speak');
  lines.push('');
  
  lines.push('**Bad Example 2: Robotic First-Person**');
  lines.push('```');
  lines.push('I have tested the product. I have found it satisfactory. I believe users would appreciate it. I think the price is reasonable. I would recommend it.');
  lines.push('```');
  lines.push('**Issues:** Every sentence starts with "I", monotonous rhythm, no personality');
  lines.push('');
  
  lines.push('**Bad Example 3: Generic Superlatives**');
  lines.push('```');
  lines.push('This delivers exceptional performance. The build quality is outstanding. Setup is very easy. Highly recommended without reservation.');
  lines.push('```');
  lines.push('**Issues:** Generic praise, no specifics, no honest caveats, reads like marketing');
  lines.push('');
  
  // ============================================================
  // APPENDIX B: VALIDATION CHECKLIST
  // ============================================================
  lines.push('---');
  lines.push('');
  lines.push('## APPENDIX B: VALIDATION CHECKLIST');
  lines.push('');
  lines.push('### Before Publishing');
  lines.push('');
  lines.push('**Voice (Soul):**');
  lines.push('- [ ] Sounds like experienced practitioner, not lecturer');
  lines.push('- [ ] At least one honest caveat or limitation mentioned');
  if (voice.equipmentSpecificity?.specific.length) {
    lines.push('- [ ] Products/tools referenced specifically ("my X" not "the product")');
  }
  lines.push('- [ ] No perfect hindsight narratives');
  lines.push('');
  
  lines.push('**Anti-AI:**');
  lines.push('- [ ] Zero AI clichés (delve, leverage, unlock, seamless, robust)');
  lines.push('- [ ] Sentence length varies naturally (some 5 words, some 35+)');
  lines.push('- [ ] Paragraph lengths vary (some 1 sentence, some 4+)');
  lines.push('- [ ] First-person distributed naturally, not sentence-starter crutch');
  lines.push('- [ ] No three consecutive sentences starting with same word');
  lines.push('');
  
  if (vocab.britishMarkers.length > 0) {
    lines.push('**British English:**');
    lines.push('- [ ] 100% British spelling (colour, optimise, centre)');
    lines.push('- [ ] Natural British vocabulary');
    lines.push('');
  }
  
  lines.push('**Technical:**');
  lines.push('- [ ] Domain vocabulary used naturally');
  lines.push('- [ ] Real examples and specifics provided');
  lines.push('- [ ] Transitions flow naturally');
  lines.push('');
  
  // ============================================================
  // QUICK REFERENCE
  // ============================================================
  lines.push('---');
  lines.push('');
  lines.push('## QUICK REFERENCE CARD');
  lines.push('');
  lines.push(`**Sentence length:** ${sentence.length.mean.toFixed(0)}±${sentence.length.stdDev.toFixed(0)} words`);
  lines.push(`**First-person:** ${voice.firstPerson.frequency.toFixed(2)} per 100 words`);
  lines.push(`**British English:** ${vocab.britishMarkers.length > 0 ? 'MANDATORY' : 'Standard'}`);
  lines.push(`**Hedging:** ${voice.hedgingLanguage.frequency < 0.5 ? 'Minimal (confident)' : 'Moderate'}`);
  if (punctuation) {
    lines.push(`**Exclamation marks:** ${punctuation.exclamationFrequency.toFixed(1)}/1000 words`);
  }
  lines.push('');
  
  if (wordNGrams && wordNGrams.categoryPatterns.firstPerson.length > 0) {
    lines.push(`**Top phrases:** ${wordNGrams.categoryPatterns.firstPerson.slice(0, 3).map(p => p.ngram).join(', ')}`);
    lines.push('');
  }
  
  lines.push('**FORBIDDEN:** delve, leverage, unlock, seamless, robust, utilize, harness, game-changer, cutting-edge');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('**END OF VOICE GUIDE v4.1**');
  
  return lines.join('\n');
}

/**
 * Analyze an example paragraph for pattern annotations
 */
function analyzeExample(
  text: string,
  wordNGrams: WordNGramAnalysis | null,
  vocab: VocabularyAnalysis,
  voice: VoiceMarkers
): string[] {
  const annotations: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Check for first-person patterns
  const firstPersonMatches: string[] = [];
  if (wordNGrams && wordNGrams.categoryPatterns.firstPerson) {
    for (const pattern of wordNGrams.categoryPatterns.firstPerson.slice(0, 10)) {
      if (lowerText.includes(pattern.ngram.toLowerCase())) {
        firstPersonMatches.push(`"${pattern.ngram}"`);
      }
    }
  }
  if (firstPersonMatches.length > 0) {
    annotations.push(`First-person authority: ${firstPersonMatches.slice(0, 3).join(', ')}`);
  }
  
  // Check for technical terms
  const techTermMatches: string[] = [];
  for (const term of vocab.technicalTerms.slice(0, 20)) {
    if (lowerText.includes(term.word.toLowerCase())) {
      techTermMatches.push(term.word);
    }
  }
  if (techTermMatches.length > 0) {
    annotations.push(`Technical vocabulary: ${techTermMatches.slice(0, 4).join(', ')}`);
  }
  
  // Check for transitional phrases
  if (wordNGrams && wordNGrams.categoryPatterns.transitional) {
    const transitionalMatches: string[] = [];
    for (const pattern of wordNGrams.categoryPatterns.transitional) {
      if (lowerText.includes(pattern.ngram.toLowerCase())) {
        transitionalMatches.push(`"${pattern.ngram}"`);
      }
    }
    if (transitionalMatches.length > 0) {
      annotations.push(`Transitional phrases: ${transitionalMatches.slice(0, 2).join(', ')}`);
    }
  }
  
  // Sentence length variation
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 1) {
    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const minLen = Math.min(...lengths);
    const maxLen = Math.max(...lengths);
    const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    annotations.push(`Sentence variation: ${minLen}-${maxLen} words (avg ${avgLen.toFixed(1)})`);
  }
  
  // AI cliché check
  const aiCliches = ['delve', 'leverage', 'unlock', 'seamless', 'robust', 'harness', 'cutting-edge'];
  const foundCliches = aiCliches.filter(c => lowerText.includes(c));
  if (foundCliches.length === 0) {
    annotations.push('Zero AI clichés detected');
  }
  
  // British markers
  const britishMatches: string[] = [];
  for (const marker of vocab.britishMarkers) {
    if (lowerText.includes(marker.word.toLowerCase())) {
      britishMatches.push(marker.word);
    }
  }
  if (britishMatches.length > 0) {
    annotations.push(`British markers: ${britishMatches.join(', ')}`);
  }
  
  return annotations;
}

/**
 * Format writer name for display
 */
function formatWriterName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate human-readable guide
 */
function generateHumanGuide(
  writerName: string,
  metadata: any,
  vocab: VocabularyAnalysis,
  sentence: SentenceAnalysis,
  voice: VoiceMarkers,
  paragraph: ParagraphAnalysis | null,
  punctuation: PunctuationAnalysis | null,
  functionWords: FunctionWordAnalysis | null,
  antiMechanical: AntiMechanicalAnalysis | null
): string {
  const lines: string[] = [];
  
  lines.push(`# ${formatWriterName(writerName)} - Voice Summary`);
  lines.push('');
  lines.push('**For human editors and writers**');
  lines.push('');
  
  lines.push('## Quick Profile');
  lines.push('');
  lines.push(`- **Articles analyzed:** ${metadata.statistics.total_articles}`);
  lines.push(`- **Total words:** ${metadata.statistics.total_words.toLocaleString()}`);
  if (antiMechanical) {
    lines.push(`- **Naturalness score:** ${antiMechanical.naturalness.totalScore}/100`);
  }
  lines.push('');
  
  lines.push('## Voice Characteristics');
  lines.push('');
  
  // Build characteristics
  const chars: string[] = [];
  
  if (voice.firstPerson.frequency > 0.3) {
    chars.push(`First-person authority (${voice.firstPerson.frequency.toFixed(2)} per 100 words)`);
  }
  if (voice.hedgingLanguage.frequency < 0.5) {
    chars.push('Direct and confident tone');
  } else {
    chars.push('Measured, careful hedging');
  }
  if (vocab.britishMarkers.length > 0) {
    chars.push('British English throughout');
  }
  if (voice.conversationalMarkers.length > 3) {
    chars.push('Conversational markers ("look", "well", "actually")');
  }
  
  for (const char of chars) {
    lines.push(`- ${char}`);
  }
  lines.push('');
  
  lines.push('## Key Statistics');
  lines.push('');
  lines.push(`- Sentence length: ${sentence.length.mean.toFixed(1)} ±${sentence.length.stdDev.toFixed(1)} words`);
  if (paragraph) {
    lines.push(`- Paragraph length: ${paragraph.sentencesPerParagraph.mean.toFixed(1)} sentences`);
  }
  if (punctuation) {
    lines.push(`- Exclamation frequency: ${punctuation.exclamationFrequency.toFixed(1)} per 1000 words`);
  }
  lines.push('');
  
  lines.push('## Top Vocabulary');
  lines.push('');
  lines.push(vocab.technicalTerms.slice(0, 15).map(t => t.word).join(', '));
  lines.push('');
  
  if (voice.aiCliches.length > 0) {
    lines.push('## ⚠️ AI Clichés to Remove');
    lines.push('');
    for (const c of voice.aiCliches) {
      lines.push(`- "${c.phrase}" (${c.count} uses)`);
    }
    lines.push('');
  }
  
  lines.push('## Guidelines');
  lines.push('');
  lines.push('1. Use first-person to establish authority');
  if (vocab.britishMarkers.length > 0) {
    lines.push('2. Always use British English spelling');
  }
  lines.push('3. Vary sentence length naturally');
  lines.push('4. Avoid AI clichés (delve, leverage, unlock, etc.)');
  lines.push('5. Include domain-specific terminology');
  lines.push('');
  
  return lines.join('\n');
}

// Export for tool registration
export { generateSoulFirstLLMGuide, generateHumanGuide };
