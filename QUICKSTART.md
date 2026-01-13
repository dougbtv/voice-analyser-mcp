# Voice Analyser - Quick Start

## Installation

Add to Claude Desktop `claude_desktop_config.json`:

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

Restart Claude Desktop.

## 3-Step Workflow

### 1. Collect Corpus
```
Collect corpus from https://example.com/post-sitemap.xml as "author-name"
```

### 2. Analyze Writing
```
Analyse corpus "author-name"
```

### 3. Generate Voice Guide
```
Generate enhanced guide for "author-name"
```

## What You Get

**Analysis Files:**
- Vocabulary patterns and technical terms
- Sentence length distributions
- Function word fingerprints (z-scores)
- AI cliché detection
- N-gram patterns (character, word, POS)

**Voice Guide:**
- 20,000+ word LLM-optimized style template
- Statistical targets with examples
- Anti-mechanical writing rules
- AI detection avoidance metrics (v2.0)

## Common Examples

**Collect from RSS:**
```
Collect corpus from https://example.com/feed/ as "author-name" with max 50 articles
```

**Filter URLs:**
```
Collect corpus from https://example.com/sitemap.xml as "author-name" filtering URLs matching "blog"
```

**Quick analysis:**
```
Analyse corpus "author-name" with quick analysis
```

**Generate both formats:**
```
Generate enhanced guide for "author-name" in both formats
```

## Output Location

```
corpus/author-name/
├── articles/           # Collected markdown
├── corpus.json         # Metadata
└── analysis/          # Statistical analysis
    ├── vocabulary.json
    ├── sentence.json
    ├── function-words.json
    ├── author-name-analysis-v2.json  # v2.0 anti-detection metrics
    └── [20+ analysis files]

templates/
└── writing_style_author-name.md   # Your voice guide
```

## Corpus Requirements

- Minimum 10 articles recommended
- 10,000+ words ideal for statistical significance
- Published content works best (blog posts, articles)

## Next Steps

See [README.md](README.md) for:
- Full tool reference
- Detailed metrics explanation
- Advanced usage examples
- Integration with Content Machine

## Support

- GitHub: [houtini-ai/voice-analyser-mcp](https://github.com/houtini-ai/voice-analyser-mcp)
- NPM: [@houtini/voice-analyser](https://www.npmjs.com/package/@houtini/voice-analyser)
