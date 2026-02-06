/**
 * Tool: get_voice_guide
 * Retrieve generated voice guide for injection into LLM context
 */

import fs from 'fs/promises';
import path from 'path';
import { getBaseDir } from '../utils/paths.js';

export interface GetVoiceGuideParams {
  corpus_name: string;
  format?: 'full' | 'quick-ref' | 'core-patterns' | 'anti-patterns';
}

export interface GetVoiceGuideResult {
  success: boolean;
  corpus_name: string;
  format: string;
  content: string;
  guide_path?: string;
  error?: string;
}

export async function getVoiceGuide(params: GetVoiceGuideParams): Promise<GetVoiceGuideResult> {
  const { corpus_name, format = 'core-patterns' } = params;

  const templatesDir = path.join(getBaseDir(), 'templates');
  const guidePath = path.join(templatesDir, `writing_style_${corpus_name}.md`);

  try {
    // Check if guide exists
    await fs.access(guidePath);

    // Read the full guide
    const fullContent = await fs.readFile(guidePath, 'utf-8');

    // Extract content based on format
    let content: string;

    switch (format) {
      case 'full':
        content = fullContent;
        break;

      case 'quick-ref':
        content = extractQuickRef(fullContent);
        break;

      case 'core-patterns':
        content = extractCorePatterns(fullContent);
        break;

      case 'anti-patterns':
        content = extractAntiPatterns(fullContent);
        break;

      default:
        content = extractCorePatterns(fullContent);
    }

    return {
      success: true,
      corpus_name,
      format,
      content,
      guide_path: guidePath
    };

  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {
        success: false,
        corpus_name,
        format,
        content: '',
        error: `Voice guide not found for corpus "${corpus_name}". Run "Generate enhanced guide for '${corpus_name}'" first.`
      };
    }

    return {
      success: false,
      corpus_name,
      format,
      content: '',
      error: `Failed to read voice guide: ${error}`
    };
  }
}

/**
 * Extract quick reference section
 */
function extractQuickRef(content: string): string {
  const lines: string[] = [];

  lines.push('# Quick Voice Reference\n');

  // Extract title and writer name
  const titleMatch = content.match(/^# (.+?) Writing Style Guide/m);
  if (titleMatch) {
    lines.push(`Writer: ${titleMatch[1]}\n`);
  }

  // Extract quick reference card
  const quickRefMatch = content.match(/## QUICK REFERENCE CARD\n\n([\s\S]+?)---/);
  if (quickRefMatch) {
    lines.push('## Key Metrics\n');
    lines.push(quickRefMatch[1].trim());
    lines.push('\n');
  }

  // Extract forbidden list
  const forbiddenMatch = content.match(/### Zero Tolerance AI Clichés\n\n([\s\S]+?)(?=###|---|\n##)/);
  if (forbiddenMatch) {
    lines.push('## Forbidden Phrases\n');
    lines.push(forbiddenMatch[1].trim());
    lines.push('\n');
  }

  return lines.join('\n');
}

/**
 * Extract core patterns for writing
 */
function extractCorePatterns(content: string): string {
  const lines: string[] = [];

  // Extract title
  const titleMatch = content.match(/^# (.+?) Writing Style Guide/m);
  if (titleMatch) {
    lines.push(`# ${titleMatch[1]} Voice Patterns\n`);
  }

  // Extract philosophy
  const philMatch = content.match(/\*\*Philosophy:\*\* (.+)/);
  if (philMatch) {
    lines.push(`**Core Philosophy:** ${philMatch[1]}\n`);
  }

  // Extract identity
  const identityMatch = content.match(/### Who Is This Writer\?\n\n([\s\S]+?)(?=###)/);
  if (identityMatch) {
    lines.push('## Writer Identity\n');
    lines.push(identityMatch[1].trim());
    lines.push('\n');
  }

  // Extract opening patterns
  const openingMatch = content.match(/### Opening Patterns\n\n([\s\S]+?)(?=###)/);
  if (openingMatch) {
    lines.push('## Opening Patterns\n');
    lines.push(openingMatch[1].trim());
    lines.push('\n');
  }

  // Extract hedging & confidence
  const hedgingMatch = content.match(/### Hedging & Confidence Balance\n\n([\s\S]+?)(?=###)/);
  if (hedgingMatch) {
    lines.push('## Hedging & Confidence\n');
    lines.push(hedgingMatch[1].trim());
    lines.push('\n');
  }

  // Extract first-person patterns
  const firstPersonMatch = content.match(/### First-Person Authority\n\n([\s\S]+?)(?=###|---)/);
  if (firstPersonMatch) {
    lines.push('## First-Person Usage\n');
    lines.push(firstPersonMatch[1].trim());
    lines.push('\n');
  }

  // Extract sentence variation
  const sentenceMatch = content.match(/\*\*Sentence Length Variation \(CRITICAL\):\*\*\n\n([\s\S]+?)(?=\*\*Test:|###)/);
  if (sentenceMatch) {
    lines.push('## Sentence Variation (CRITICAL)\n');
    lines.push(sentenceMatch[1].trim());
    lines.push('\n');
  }

  // Extract forbidden list
  const forbiddenMatch = content.match(/### Zero Tolerance AI Clichés\n\n([\s\S]+?)(?=\*\*Detection Test:|###)/);
  if (forbiddenMatch) {
    lines.push('## Forbidden AI Clichés\n');
    lines.push(forbiddenMatch[1].trim());
    lines.push('\n');
  }

  // Extract quick reference
  const quickRefMatch = content.match(/## QUICK REFERENCE CARD\n\n([\s\S]+?)---/);
  if (quickRefMatch) {
    lines.push('## Quick Reference\n');
    lines.push(quickRefMatch[1].trim());
    lines.push('\n');
  }

  return lines.join('\n');
}

/**
 * Extract anti-patterns and what to avoid
 */
function extractAntiPatterns(content: string): string {
  const lines: string[] = [];

  lines.push('# Anti-Patterns & What to Avoid\n');

  // Extract mechanical voice problem
  const mechanicalMatch = content.match(/### The Mechanical Voice Problem\n\n([\s\S]+?)(?=###)/);
  if (mechanicalMatch) {
    lines.push('## Mechanical Voice Traps\n');
    lines.push(mechanicalMatch[1].trim());
    lines.push('\n');
  }

  // Extract forbidden list
  const forbiddenMatch = content.match(/## PART FOUR: THE FORBIDDEN LIST\n\n([\s\S]+?)(?=## PART FIVE|---\n\n##)/);
  if (forbiddenMatch) {
    lines.push('## Forbidden Phrases & Patterns\n');
    lines.push(forbiddenMatch[1].trim());
    lines.push('\n');
  }

  // Extract bad examples
  const badExamplesMatch = content.match(/### ❌ Bad Examples \(What to Avoid\)\n\n([\s\S]+?)(?=---\n\n##)/);
  if (badExamplesMatch) {
    lines.push('## Bad Examples\n');
    lines.push(badExamplesMatch[1].trim());
    lines.push('\n');
  }

  // Extract AI detection warnings
  const detectionMatch = content.match(/## 🚨 AI DETECTION AVOIDANCE[\s\S]+?### ❌ CRITICAL RISKS \(Fix Immediately\)\n\n([\s\S]+?)(?=###)/);
  if (detectionMatch) {
    lines.push('## Critical AI Detection Risks\n');
    lines.push(detectionMatch[1].trim());
    lines.push('\n');
  }

  return lines.join('\n');
}
