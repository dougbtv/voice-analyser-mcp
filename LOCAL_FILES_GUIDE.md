# Using Voice Analyser with Local Files

This guide shows you how to use Voice Analyser with your local markdown files (Obsidian notes, blog posts, etc.) instead of web URLs.

## Quick Setup

### 1. Install Dependencies and Build

```bash
cd /home/hdds/480ssd/codebase/voice-analyser-mcp
npm install
npm run build
```

### 2. Import Your Local Files

Import your blog posts:
```bash
npm run import /home/doug/codebase/dougbtv.github.io/_posts doug-blog
```

Import your Obsidian notes:
```bash
npm run import /home/doug/codebase/dougbtv-redhat-notes doug-notes
```

Or combine both into one corpus:
```bash
# First, copy all files to a temporary combined directory
mkdir -p /tmp/doug-combined
cp -r /home/doug/codebase/dougbtv.github.io/_posts/* /tmp/doug-combined/
cp -r /home/doug/codebase/dougbtv-redhat-notes/*.md /tmp/doug-combined/

# Then import
npm run import /tmp/doug-combined doug-combined
```

### 3. Configure Claude Desktop

Add this to your `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "voice-analysis": {
      "command": "node",
      "args": ["/home/hdds/480ssd/codebase/voice-analyser-mcp/dist/index.js"]
    }
  }
}
```

**Important:** Restart Claude Desktop after saving this config.

### 4. Analyze Your Writing in Claude Desktop

Open Claude Desktop and run these commands:

**For blog posts:**
```
Analyse corpus "doug-blog"
Generate enhanced guide for "doug-blog"
```

**For notes:**
```
Analyse corpus "doug-notes"
Generate enhanced guide for "doug-notes"
```

**For combined:**
```
Analyse corpus "doug-combined"
Generate enhanced guide for "doug-combined"
```

## What You'll Get

### Analysis Files
Located in `corpus/{name}/analysis/`:
- Vocabulary patterns
- Sentence length distributions
- Function word fingerprints (z-scores)
- N-gram patterns
- AI cliché detection
- And 20+ other statistical analyses

### Voice Guide
Located in `templates/writing_style_{name}.md`:
- 20,000+ word style guide optimized for LLMs
- Statistical targets with concrete examples
- Your unique writing patterns and markers
- Anti-mechanical writing rules

## Tips

**Corpus Size:**
- Minimum: 10 articles, 10,000 words
- Recommended: 30,000+ words
- More data = better statistical significance

**Best Practices:**
- Use published/polished writing (not drafts or scratch notes)
- Combine multiple sources for a richer corpus
- Review the generated guide and customize it further

**Using the Voice Guide:**
When you want Claude to write in your style, include the generated guide in your project context or paste relevant sections into your prompts.

## Troubleshooting

**"MCP server not found"**
- Make sure you built the project (`npm run build`)
- Check the path in claude_desktop_config.json is correct
- Restart Claude Desktop

**"No corpus found"**
- Check the corpus name matches exactly (case-sensitive)
- Verify files were imported: `ls corpus/doug-blog/articles/`

**"Not enough data"**
- Need minimum 10,000 words
- Check word count: `cat corpus/doug-blog/corpus.json | grep total_words`

## Advanced: Multiple Corpora

You can create separate corpora for different writing styles:

```bash
# Technical blog posts only
npm run import /home/doug/codebase/dougbtv.github.io/_posts/2017* doug-technical

# Personal notes only
npm run import /home/doug/codebase/dougbtv-redhat-notes/weekly doug-weekly-notes
```

Then analyze each separately to see how your style differs across contexts.
