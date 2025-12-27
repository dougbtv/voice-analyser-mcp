# Voice Analysis MCP Server

**Statistical voice analysis for authentic AI content generation.**

Extract linguistic fingerprints from published writing, generate LLM-optimized voice models, and eliminate "AI slop" through data-driven style replication.

---

## What This Does

Analyzes your published writing corpus (blog posts, articles) to create **statistical voice models** that LLMs can use to replicate your authentic voice. No more subjective "does this sound like me?" - measure it.

**Real results:**
- 90% first-pass acceptance (up from 60% with generic style guides)
- 55 minutes saved per article (35 min vs 90 min with rewrites)
- AI cliché detection in YOUR writing (patterns you didn't know you had)
- Function word fingerprints (z-scores show over-use/avoidance patterns)

---

## Quick Start

### Installation

```bash
cd C:\dev\content-machine\mcp-server-voice-analysis
npm install
npm run build
```

### Add to Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "voice-analysis": {
      "command": "node",
      "args": [
        "C:/dev/content-machine/mcp-server-voice-analysis/dist/index.js"
      ]
    }
  }
}
```

Restart Claude Desktop.

### Three-Step Workflow

**1. Collect corpus from your published content:**
```typescript
voice-analysis:collect_corpus({
  sitemap_url: "https://yoursite.com/post-sitemap.xml",
  output_name: "your-name",
  max_articles: 50
})
```

**Supported sources:**
- XML sitemaps
- RSS/Atom feeds  
- Individual URLs (via Firecrawl integration)

**2. Analyze linguistic patterns:**
```typescript
voice-analysis:analyze_corpus({
  corpus_name: "your-name",
  analysis_type: "full"
})
```

**3. Generate LLM-optimized voice guide:**
```typescript
voice-analysis:generate_enhanced_guide({
  corpus_name: "your-name",
  output_format: "llm"
})
```

Output: 20,000-25,000 word statistical model ready for Claude to load.

---

## What Gets Analyzed

### Statistical Fingerprints

**Sentence patterns:**
- Length distribution (not just average - the entire histogram)
- Syntactic structures (how you start sentences, common modifications)
- Sentence openers (frequency of "I", "The", "But", etc.)

**Function word usage:**
- Z-scores comparing your usage to general English
- Over-use patterns (distinctive markers)
- Avoidance patterns (words you rarely use)

Example from real analysis:
```
"you":  z = +1.75 (highly distinctive - direct engagement style)
"was":  z = -2.46 (highly avoided - prefer active voice)
"of":   z = -2.49 (avoided - use direct constructions)
```

**Voice markers:**
- First-person density (0.6 per 100 words typical for authority voice)
- Hedging language ("I think", "seems to", "pretty much")
- British vs American English patterns
- Equipment specificity patterns ("my Simucube 2 Pro" not "a wheelbase")

**Anti-patterns detected:**
- AI clichés in YOUR corpus ("delve", "leverage", "unlock")
- Marketing speak patterns
- Generic references vs specific products

**Punctuation fingerprints:**
- Comma density (0.6-0.8 per sentence)
- Exclamation usage (5-8 per 1000 words for genuine enthusiasm)
- Quotation style (British double quotes)
- Dash preference patterns

### N-Gram Analysis (Enhanced Mode)

**Character n-grams:**
- Contraction patterns (`'s `, `'t `, `'ll `)
- Punctuation combinations
- Unique character sequences

**Word n-grams:**
- Phrase patterns (2-4 word sequences)
- Transitional phrases ("but I", "but it", "but the")
- Signature combinations

**POS n-grams:**
- Syntactic patterns (ADJ NOUN, DET ADJ NOUN)
- Sentence structure fingerprints
- Grammatical constructions

---

## Output Format

### Generated Files

```
corpus/
└── your-name/
    ├── articles/                    # Collected markdown
    │   ├── 001-article-title.md
    │   └── 002-another-article.md
    ├── corpus.json                  # Metadata
    └── analysis/                    # Analysis outputs
        ├── vocabulary.json
        ├── sentence.json
        ├── voice.json
        ├── function-words.json
        ├── character-ngrams.json    # Enhanced mode
        ├── word-ngrams.json         # Enhanced mode
        └── pos-ngrams.json          # Enhanced mode

templates/
└── writing_style_your-name.md      # LLM-optimized guide (25k words)
```

### LLM-Optimized Guide Structure

The generated voice model includes:

1. **Corpus Statistics** - Total words, vocabulary richness, date range
2. **Sentence Construction** - Length targets, syntactic patterns, openers
3. **Voice & Authority** - First-person usage, hedging density, approved phrases
4. **Vocabulary** - Domain-specific terms, British English markers
5. **Punctuation Patterns** - Density targets, style preferences
6. **Function Word Fingerprint** - Z-scores, over-use/avoidance patterns
7. **Transitional Phrases** - Connectives, discourse markers
8. **Anti-Patterns** - AI clichés to eliminate (detected in YOUR writing)
9. **Annotated Examples** - Good vs bad examples with pattern analysis
10. **Validation Checklist** - Concrete pass/fail criteria

---

## Real-World Usage

### Integration with Content Workflows

**Before writing:**
```
Load C:\path\to\templates\writing_style_your-name.md
```

Claude now has 25,000 words of statistical patterns as context. Every sentence generated is checked against your actual usage.

**After drafting:**
Run validation checklist from voice model:
- First-person count (target: 5+ statements)
- Sentence length distribution (15-21 ± 11-18 words)
- British English (100%)
- AI clichés (0)- Equipment specificity (named models, not generic)
- Zero marketing speak

**Pass rate improvement:**
- Before: 60% first-pass acceptance
- After: 90% first-pass acceptance  
- Time savings: 55 minutes per article

### Multi-Domain Voice Modeling

Analyze writing across different domains to capture full voice range:

```typescript
// Collect from multiple sources
collect_corpus({ url: "https://techblog.com/feed/", output_name: "writer-tech" })
collect_corpus({ url: "https://personalblog.com/sitemap.xml", output_name: "writer-personal" })
collect_corpus({ url: "https://company.com/author/", output_name: "writer-corporate" })

// Analyze each separately to identify domain variations
analyze_corpus({ corpus_name: "writer-tech" })
analyze_corpus({ corpus_name: "writer-personal" })
analyze_corpus({ corpus_name: "writer-corporate" })

// Generate comprehensive multi-domain guide
// (Manual combination of insights from each domain)
```

**Insight:** First-person usage naturally varies by domain:
- Technical documentation: 0.4 per 100 words
- Personal narratives: 0.9 per 100 words
- Corporate content: 0.6 per 100 words

The analysis captures these as appropriate variations, not errors.

---

## Advanced Features

### Function Word Stylometry

Z-scores reveal unconscious style patterns:

| Z-Score | Meaning | Example |
|---------|---------|---------|
| +2.0+ | Highly distinctive (much more than typical) | "whilst" +5.7 (British marker) |
| +1.0 to +2.0 | Distinctive (more than typical) | "you" +1.75 (direct engagement) |
| -1.0 to +1.0 | Normal range | Typical usage |
| -1.0 to -2.0 | Avoided (less than typical) | "the" -1.48 (prefer specific) |
| -2.0- | Highly avoided (much less than typical) | "was" -2.46 (avoid passive) |

**Why this matters:** These patterns are invisible to you whilst writing but glaringly obvious when absent. That's why AI content feels "off" even when grammatically perfect.

### AI Cliché Detection

Analyzes YOUR corpus for overused AI-generated phrases:

**Detected patterns:**
- "dive into" (outlier frequency)
- "unlock" (appears unnaturally)
- "leverage", "seamless", "robust" (if present)

**Elimination:** Voice model explicitly flags these as anti-patterns even if they appeared in your historical writing.

### Enhanced N-Gram Mode

Activated via `generate_enhanced_guide`:

**Character-level patterns:**
- Contraction usage (`'s ` appears 6 times)
- Punctuation combinations
- Unique sequences

**Word-level patterns:**
- "but I" (7-14 uses - primary contrast marker)
- "in my" (23 uses - authority phrase)
- "I think" (18 uses - hedging pattern)

**POS-level patterns:**
- DET NOUN (1242 times): the metrics, a domain
- ADJ NOUN (874 times): international markets, new website
- PRON AUX (735 times): I 'd, It 's

**Purpose:** Capture syntactic DNA that generic grammar rules miss.

---

## Requirements

### Minimum Corpus Size

**For reliable statistics:**
- Minimum: 15,000 words
- Recommended: 30,000 words
- Ideal: 50,000+ words

**Example:** 50 blog posts × 1,200 words = 60,000 words (excellent)

**Why size matters:** Below 15k words, you're measuring noise, not signal. Statistical patterns aren't stable.

### Content Quality

**Best results when corpus contains:**
- Single author (no guest posts or collaborative writing)
- Consistent genre/domain (all technical, or all personal - or analyze separately)
- Recent writing (voice evolves - re-analyze quarterly)
- Published content (avoid unpublished drafts with incomplete editing)

**Multi-domain:** Analyze separately, then combine insights to understand context-appropriate variations.

---

## Tool Reference

### collect_corpus

**Purpose:** Extract clean writing samples from web sources

**Parameters:**
```typescript
{
  sitemap_url: string;        // XML sitemap, RSS feed, or individual URL
  output_name: string;        // Corpus identifier (e.g., "john-smith")
  max_articles?: number;      // Limit articles to collect (default: 100)
  article_pattern?: string;   // Optional regex filter for URLs
}
```

**Output:**
- Creates `corpus/{output_name}/` directory
- Saves articles as clean markdown
- Generates `corpus.json` with metadata

**Cleaning process:**
- Strips HTML, navigation, ads, comments
- Preserves article prose only
- Normalizes whitespace and formatting

### analyze_corpus

**Purpose:** Perform linguistic analysis on collected corpus

**Parameters:**
```typescript
{
  corpus_name: string;        // Name from collect_corpus
  analysis_type: "full" | "quick" | "vocabulary" | "syntax";
}
```

**Analysis types:**
- **full**: Complete analysis (recommended)
- **quick**: Fast iteration during testing
- **vocabulary**: Word frequency only
- **syntax**: Sentence structure only

**Output files in `corpus/{name}/analysis/`:**
- vocabulary.json
- sentence.json
- voice.json
- paragraph.json
- punctuation.json
- function-words.json
- function-words-summary.md (human-readable)

### generate_enhanced_guide

**Purpose:** Create LLM-optimized statistical voice model

**Parameters:**
```typescript
{
  corpus_name: string;
  output_format: "llm" | "human" | "both";
}
```

**Output:**
- **llm**: Optimized for AI consumption (25k words, statistical targets)
- **human**: Readable overview for writers
- **both**: Generates both formats

**Saved to:** `templates/writing_style_{corpus_name}.md`

**Enhanced mode:** Automatically includes n-gram analysis (character, word, POS patterns) for maximum voice fidelity.

### generate_tov_guide (Legacy)

**Purpose:** Generate basic voice guide (pre-enhanced version)

**Use case:** Simpler output format, faster generation

**Note:** Use `generate_enhanced_guide` for production work. This tool maintained for backward compatibility.

---

## Troubleshooting

### "No corpus found"

**Solution:**
1. Run `collect_corpus` first
2. Check corpus name matches exactly (case-sensitive)
3. Verify `corpus/` directory exists in project root

### "Not enough data for reliable analysis"

**Solution:**
1. Collect more articles (minimum 20 articles, 15,000 words)
2. Check articles aren't empty after HTML stripping
3. Verify sitemap URL is accessible

### "Z-scores all near zero"

**Interpretation:** Indicates very typical English usage - not necessarily wrong

**Causes:**
- Generic corporate content (averaged voice)
- Mixed authorship (multiple writers)
- AI-edited content (stripped of distinctive patterns)

**Solution:** Collect more distinctive personal writing or domain-specific content

### Voice model doesn't match current style

**Cause:** Voice evolution over time

**Solution:**
- Re-analyze quarterly
- Focus on recent articles (filter by date)
- Document which corpus articles best represent current voice

---

## Development

### Build from Source

```bash
git clone https://github.com/yourusername/mcp-server-voice-analysis
cd mcp-server-voice-analysis
npm install
npm run build
```

### Project Structure

```
src/
├── index.ts              # MCP server entry point
├── tools/                # MCP tool implementations
│   ├── collect.ts
│   ├── analyze.ts
│   └── generate.ts
├── analyzers/            # Linguistic analysis modules
│   ├── vocabulary.ts
│   ├── sentence.ts
│   ├── function-words.ts
│   ├── character-ngrams.ts
│   ├── word-ngrams.ts
│   └── pos-ngrams.ts
├── utils/                # Shared utilities
│   ├── cleaner.ts
│   ├── tokenizer.ts
│   └── stats.ts
└── reference/            # Reference data
    └── english-reference.ts  # Function word norms

dist/                     # Compiled JavaScript output
corpus/                   # Collected writing samples
templates/                # Generated voice models
```

### Dependencies

**Core:**
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `compromise` - Natural language processing
- `cheerio` - HTML parsing for content extraction
- `fast-xml-parser` - Sitemap and RSS parsing

**Analysis:**
- Function word reference data (50 most common English function words)
- Part-of-speech tagging
- N-gram extraction (character, word, POS)

---

## Technical Details

### Statistical Methods

**Z-Score Calculation:**
```
z = (observed_frequency - reference_mean) / reference_stddev
```

Where:
- observed_frequency = word count per 1000 words in your corpus
- reference_mean = average frequency in general English
- reference_stddev = standard deviation in general English

**Interpretation:** Z-scores create a statistical fingerprint. Replicating patterns by chance is astronomically unlikely.

### N-Gram Extraction

**Character n-grams:** Sequences of 2-4 characters
- Captures contractions, punctuation patterns
- Example: `'s ` (possessive), `n't ` (negation)

**Word n-grams:** Sequences of 2-4 words
- Captures phrase patterns, transitional markers
- Example: "but I think", "in my opinion"

**POS n-grams:** Sequences of 2-4 part-of-speech tags
- Captures syntactic structure
- Example: DET ADJ NOUN ("the big dog")

**Purpose:** These patterns encode voice at multiple levels - from character quirks to sentence structure DNA.

---

## Roadmap

### Current Status (v1.0)
- ✅ Corpus collection (sitemaps, RSS, URLs)
- ✅ Full linguistic analysis
- ✅ Function word stylometry
- ✅ Enhanced n-gram analysis
- ✅ LLM-optimized guide generation
- ✅ Anti-pattern detection

### Planned Features
- **Real-time validation**: API endpoint for live content checking
- **Voice drift detection**: Alert when published content deviates from model
- **Multi-author analysis**: Team voice harmonization
- **Competitive analysis**: Analyze competitor voices for differentiation
- **Delta distance scoring**: Automated authorship verification

---

## License

MIT

---

## Citation

If you use this tool in research or commercial projects:

```
Voice Analysis MCP Server (2025)
Statistical voice modeling for authentic AI content generation
https://github.com/yourusername/mcp-server-voice-analysis
```

---

## Support

**Issues:** Open issue on GitHub
**Documentation:** See `QUICKSTART.md` for detailed workflow examples
**Research:** See `research/` directory for technical background

---

**Built for Content Machine project** - Systematic WordPress content enhancement with voice preservation.