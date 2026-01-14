#!/usr/bin/env node
/**
 * Import local markdown files into corpus format
 * Usage: node scripts/import-local-files.ts <source-dir> <corpus-name>
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ArticleMetadata {
  title: string;
  url: string;
  date: string;
  wordCount: number;
}

async function countWords(text: string): Promise<number> {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

async function extractTitle(content: string, filename: string): Promise<string> {
  // Try to extract from frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const titleMatch = frontmatterMatch[1].match(/title:\s*(.+)/);
    if (titleMatch) {
      return titleMatch[1].trim().replace(/^["']|["']$/g, '');
    }
  }

  // Try to find first # heading
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  // Fall back to filename
  return path.basename(filename, '.md').replace(/-/g, ' ');
}

async function extractDate(content: string, filename: string): Promise<string> {
  // Try to extract from frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const dateMatch = frontmatterMatch[1].match(/date:\s*(.+)/);
    if (dateMatch) {
      return dateMatch[1].trim().replace(/^["']|["']$/g, '');
    }
  }

  // Try to extract date from filename (e.g., 2012-02-06-title.md)
  const filenameDateMatch = path.basename(filename).match(/^(\d{4}-\d{2}-\d{2})/);
  if (filenameDateMatch) {
    return filenameDateMatch[1];
  }

  return 'unknown';
}

async function cleanContent(content: string): Promise<string> {
  // Remove frontmatter if present
  let cleaned = content.replace(/^---\n[\s\S]*?\n---\n+/, '');

  // Keep the content as-is - the analyzer will handle it
  return cleaned.trim();
}

async function getAllMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip hidden directories and common non-content directories
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await walk(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

async function importLocalFiles(sourceDir: string, corpusName: string): Promise<void> {
  console.log(`Importing files from: ${sourceDir}`);
  console.log(`Corpus name: ${corpusName}`);

  // Find project root (where package.json is)
  // Script is in dist/scripts/, so go up two levels to project root
  const projectRoot = path.resolve(__dirname, '..', '..');
  const corpusDir = path.join(projectRoot, 'corpus', corpusName);
  const articlesDir = path.join(corpusDir, 'articles');

  // Create directories
  await fs.mkdir(articlesDir, { recursive: true });
  console.log(`Created corpus directory: ${corpusDir}`);

  // Get all markdown files
  const sourceFiles = await getAllMarkdownFiles(sourceDir);
  console.log(`Found ${sourceFiles.length} markdown files`);

  const articles: ArticleMetadata[] = [];
  let totalWords = 0;

  for (let i = 0; i < sourceFiles.length; i++) {
    const sourceFile = sourceFiles[i];
    const articleNum = String(i + 1).padStart(3, '0');

    try {
      const content = await fs.readFile(sourceFile, 'utf-8');

      // Extract metadata
      const title = await extractTitle(content, sourceFile);
      const date = await extractDate(content, sourceFile);
      const cleaned = await cleanContent(content);
      const wordCount = await countWords(cleaned);

      // Skip empty files
      if (wordCount < 10) {
        console.log(`Skipping ${sourceFile} (too short: ${wordCount} words)`);
        continue;
      }

      // Create filename
      const filename = `${articleNum}-${title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .substring(0, 50)}.md`;

      const filepath = path.join(articlesDir, filename);

      // Create markdown with frontmatter
      const markdown = `---
title: ${title}
url: file://${sourceFile}
date: ${date}
word_count: ${wordCount}
---

${cleaned}`;

      await fs.writeFile(filepath, markdown, 'utf-8');

      articles.push({
        title,
        url: `file://${sourceFile}`,
        date,
        wordCount
      });

      totalWords += wordCount;
      console.log(`✓ Imported: ${title} (${wordCount} words)`);

    } catch (error) {
      console.error(`✗ Failed to process ${sourceFile}:`, error);
    }
  }

  // Create corpus.json
  const corpusData = {
    name: corpusName,
    created: new Date().toISOString(),
    source_directory: sourceDir,
    articles: articles,
    statistics: {
      total_articles: articles.length,
      total_words: totalWords,
      avg_words_per_article: articles.length > 0 ? Math.round(totalWords / articles.length) : 0
    }
  };

  await fs.writeFile(
    path.join(corpusDir, 'corpus.json'),
    JSON.stringify(corpusData, null, 2),
    'utf-8'
  );

  console.log('\n✓ Import complete!');
  console.log(`Articles: ${articles.length}`);
  console.log(`Total words: ${totalWords.toLocaleString()}`);
  console.log(`Average: ${corpusData.statistics.avg_words_per_article} words/article`);
  console.log(`\nCorpus location: ${corpusDir}`);
  console.log(`\nNext steps:`);
  console.log(`1. In Claude Desktop, say: Analyse corpus "${corpusName}"`);
  console.log(`2. Then say: Generate enhanced guide for "${corpusName}"`);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node scripts/import-local-files.ts <source-dir> <corpus-name>');
  console.error('');
  console.error('Examples:');
  console.error('  node scripts/import-local-files.ts /home/doug/codebase/dougbtv-redhat-notes doug-notes');
  console.error('  node scripts/import-local-files.ts /home/doug/codebase/dougbtv.github.io/_posts doug-blog');
  process.exit(1);
}

const [sourceDir, corpusName] = args;

// Validate source directory exists
try {
  await fs.access(sourceDir);
} catch {
  console.error(`Error: Source directory does not exist: ${sourceDir}`);
  process.exit(1);
}

await importLocalFiles(sourceDir, corpusName);
