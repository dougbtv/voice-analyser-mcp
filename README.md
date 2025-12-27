# Voice Analyser

[![npm version](https://img.shields.io/npm/v/@houtini/voice-analyser)](https://www.npmjs.com/package/@houtini/voice-analyser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Extract statistical voice models from your published writing. Generate LLM-optimized style guides that actually replicate how you write.

## Installation

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "voice-analysis": {
      "command": "npx",
      "args": ["-y", "@houtini/voice-analyser@latest"]
    }
  }
}
```

**Config locations:**
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

Restart Claude Desktop after saving.

### Requirements

- Node.js 20+

## What It Does

Analyses your published writing to create statistical voice models. No subjective "does this sound like me?" - measure it.

**Captures:**
- Sentence length distributions (not averages - the full histogram)
- Function word fingerprints (z-scores showing your over-use/avoidance patterns)
- First-person density and hedging patterns
- Punctuation habits and British/American markers
- N-gram patterns at character, word, and part-of-speech levels
- AI clichés already present in YOUR writing

**Output:** 20,000-25,000 word statistical model ready for Claude to load as context.

## Quick Start

### 1. Collect Your Writing

```
Collect corpus from https://yoursite.com/post-sitemap.xml as "your-name"
```

Works with XML sitemaps, RSS feeds, or individual URLs. Collects up to 100 articles by default.

### 2. Analyse Patterns

```
Analyse corpus "your-name"
```

Generates statistical analysis of vocabulary, sentence structure, voice markers, and function word usage.

### 3. Generate Voice Model

```
Generate enhanced guide for "your-name"
```

Creates an LLM-optimized style guide with concrete targets and examples.

## Usage Examples

### Collect from Different Sources

**XML Sitemap:**
```
Collect corpus from https://example.com/post-sitemap.xml as "writer-name" with max 50 articles
```

**RSS Feed:**
```
Collect corpus from https://example.com/feed/ as "writer-name"
```

**Filter by URL pattern:**
```
Collect corpus from https://example.com/sitemap.xml as "writer-name" filtering URLs matching "blog"
```

### Analysis Options

**Full analysis (recommended):**
```
Analyse corpus "writer-name" with full analysis
```

**Quick iteration:**
```
Analyse corpus "writer-name" with quick analysis
```

### Output Formats

**LLM-optimized (for Claude context):**
```
Generate enhanced guide for "writer-name" in llm format
```

**Human-readable overview:**
```
Generate enhanced guide for "writer-name" in human format
```

**Both formats:**
```
Generate enhanced guide for "writer-name" in both formats
```

## What Gets Measured

### Function Word Stylometry

Z-scores reveal unconscious patterns:

| Z-Score | Meaning | Example |
|---------|---------|---------|
| +2.0+ | Highly distinctive | "whilst" +5.7 (British marker) |
| +1.0 to +2.0 | Distinctive | "you" +1.75 (direct engagement) |
| -1.0 to +1.0 | Normal range | Typical usage |
| -2.0 to -1.0 | Avoided | "the" -1.48 (prefer specific) |
| -2.0- | Highly avoided | "was" -2.46 (avoid passive) |

These patterns are invisible whilst writing but obvious when absent. That's why AI content feels "off" even when grammatically correct.

### Sentence Patterns

- Length distribution with variance (not just average)
- Sentence openers frequency ("I", "The", "But", etc.)
- Syntactic structures and modifications

### Voice Markers

- First-person density (0.6 per 100 words typical for authority voice)
- Hedging language frequency ("I think", "seems to")
- Equipment specificity ("my Simucube 2 Pro" vs "a wheelbase")

### N-Gram Analysis

**Word patterns:**
- "but I" (contrast marker)
- "in my" (authority phrase)
- Transitional phrases

**POS patterns:**
- DET NOUN (the metrics)
- ADJ NOUN (international markets)
- Syntactic DNA

### Anti-Patterns

Detects AI clichés in YOUR corpus:
- "delve", "leverage", "unlock"
- Marketing speak patterns
- Generic references

## Output Structure

```
corpus/
└── your-name/
    ├── articles/           # Collected markdown
    ├── corpus.json         # Metadata
    └── analysis/           # JSON analysis files

templates/
└── writing_style_your-name.md   # LLM-optimized guide
```

## Tools Reference

### collect_corpus

| Parameter | Required | Description |
|-----------|----------|-------------|
| `sitemap_url` | Yes | XML sitemap, RSS feed, or URL |
| `output_name` | Yes | Corpus identifier |
| `max_articles` | No | Limit (default: 100) |
| `article_pattern` | No | Regex filter for URLs |

### analyze_corpus

| Parameter | Required | Description |
|-----------|----------|-------------|
| `corpus_name` | Yes | Name from collect_corpus |
| `analysis_type` | No | full, quick, vocabulary, syntax |

### generate_enhanced_guide

| Parameter | Required | Description |
|-----------|----------|-------------|
| `corpus_name` | Yes | Name from analyze_corpus |
| `output_format` | No | llm, human, both |

### generate_tov_guide

Legacy basic guide generation. Use `generate_enhanced_guide` for production.

## Minimum Corpus Size

- **Minimum:** 15,000 words (20 articles)
- **Recommended:** 30,000 words
- **Ideal:** 50,000+ words

Below 15k words, you're measuring noise, not signal.

## Troubleshooting

**"No corpus found"**
Run collect_corpus first. Check name matches exactly (case-sensitive).

**"Not enough data"**
Collect more articles. Minimum 20 articles, 15,000 words.

**"Z-scores all near zero"**
Indicates typical English usage. May mean mixed authorship or AI-edited content.

## Development

```bash
git clone https://github.com/houtini-ai/voice-analyser-mcp.git
cd voice-analyser-mcp
npm install
npm run build
```

## Research Foundation

The function word stylometry approach draws from computational authorship analysis research. Z-score comparisons against reference English corpora create statistical fingerprints that are difficult to replicate by chance.

Key insight: function words (the, of, and, to) are used unconsciously and form stable individual patterns. Content words vary by topic; function words reveal the author.

---

MIT License - [Houtini.ai](https://houtini.ai)
