# Voice Analysis MCP Server - Quick Start Guide

## Installation

```bash
cd C:\dev\content-machine\mcp-server-voice-analysis
npm install
npm run build
```

## Usage with Claude Desktop

Add to your Claude Desktop MCP configuration:

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

## Available Tools

### 1. collect_corpus

Crawl a website sitemap and collect clean writing corpus.

```typescript
{
  sitemap_url: "https://simracingcockpit.gg/post-sitemap.xml",
  output_name: "richard-baxter",
  max_articles: 100,
  article_pattern: ".*" // Optional regex filter
}
```

**Output:**
- Creates `corpus/richard-baxter/` directory
- Downloads articles as clean markdown
- Saves metadata (URL, title, date)

---

### 2. analyze_corpus

Perform linguistic analysis on collected corpus.

```typescript
{
  corpus_name: "richard-baxter",
  analysis_type: "full" // or "quick", "vocabulary", "syntax"
}
```

**Output files in `corpus/richard-baxter/analysis/`:**

**Basic Analysis:**
- `vocabulary.json` - Word frequency, richness, contractions
- `sentence.json` - Sentence length distributions
- `paragraph.json` - Paragraph patterns
- `punctuation.json` - Punctuation usage
- `voice.json` - Voice markers, AI clichés

**NEW in Phase 1:**
- `function-words.json` - Function word frequencies with z-scores
- `function-words-summary.md` - Human-readable stylometric summary

**Example Function Word Output:**

```markdown
## Highly Distinctive Function Words

| Word | Frequency | Z-Score | Interpretation |
|------|-----------|---------|----------------|
| **whilst** | 2.4 | +5.7 | Highly distinctive (much more than typical) |
| **upon** | 0.8 | +2.1 | Highly distinctive (much more than typical) |
| **I** | 6.5 | +1.8 | Distinctive (more than typical) |

## Deliberately Avoided Function Words

| Word | Frequency | Z-Score | Interpretation |
|------|-----------|---------|----------------|
| **shall** | 0.0 | -2.8 | Highly avoided (much less than typical) |
```

---

### 3. generate_tov_guide

Generate tone-of-voice guide from analysis results.

```typescript
{
  corpus_name: "richard-baxter",
  output_format: "both", // "llm", "human", or "both"
  template: "comprehensive" // "minimal", "standard", or "comprehensive"
}
```

**Output:**
- `corpus/richard-baxter/guide-llm.md` - Optimized for LLM consumption
- `corpus/richard-baxter/guide-human.md` - Readable by humans
- Includes statistical fingerprint and style rules

---

## Workflow Example

**Step 1: Collect Corpus**
```
Use collect_corpus tool with:
- sitemap_url: https://simracingcockpit.gg/post-sitemap.xml
- output_name: richard-baxter
- max_articles: 50
```

**Step 2: Analyze Corpus**
```
Use analyze_corpus tool with:
- corpus_name: richard-baxter
- analysis_type: full
```

**Step 3: Review Results**
```
Check corpus/richard-baxter/analysis/function-words-summary.md
```

**Step 4: Generate Guide**
```
Use generate_tov_guide tool with:
- corpus_name: richard-baxter
- output_format: both
- template: comprehensive
```

---

## Understanding Z-Scores

**Z-Score = (Your Frequency - Average Frequency) / Standard Deviation**

### Interpretation

| Z-Score Range | Meaning | Example |
|--------------|---------|---------|
| z > +2.0 | Highly distinctive | You use this word MUCH more than typical |
| z > +1.0 | Distinctive | You use this word more than typical |
| -1.0 to +1.0 | Normal range | Typical usage |
| z < -1.0 | Avoided | You use this word less than typical |
| z < -2.0 | Highly avoided | You RARELY use this word |

### Example: Richard's Style

**Expected High Z-Scores:**
- `whilst` (+5.7): British marker, rarely used in American English
- `I` (+1.8): First-person authority, common in Richard's writing
- `actually` (+1.5): Conversational hedging

**Expected Low Z-Scores:**
- `shall` (-2.8): Formal/archaic, avoided in casual writing
- `delve` (-3.0): AI cliché, deliberately avoided

---

## Advanced Features (Phase 1)

### Delta Distance Analysis

Compare two texts to determine if they're from the same author:

```typescript
import { analyzeDelta } from './utils/delta.js';

const result = analyzeDelta(text1Frequencies, text2Frequencies, referenceStats);

console.log(result.burrowsDelta); // Lower = more similar
console.log(result.recommendation); // "Strong match - content likely from same author"
```

**Delta Thresholds:**
- < 1.0: Very likely same author
- < 1.5: Likely same author
- < 2.0: Possibly same author
- > 2.5: Likely different author

---

## File Structure

```
corpus/
└── richard-baxter/
    ├── articles/           # Collected markdown files
    │   ├── article-1.md
    │   └── article-2.md
    ├── analysis/           # Analysis outputs
    │   ├── vocabulary.json
    │   ├── sentence.json
    │   ├── function-words.json
    │   └── function-words-summary.md
    └── guide-llm.md        # Generated style guide
```

---

## Tips for Best Results

**1. Corpus Size**
- Minimum: 20,000 words for reliable statistics
- Ideal: 50,000+ words
- Richard's corpus: 61,952 words (excellent)

**2. Corpus Quality**
- Same genre/domain (e.g., all technical writing)
- Consistent time period (style changes over years)
- Single author (no guest posts)

**3. Analysis Type**
- Use `"full"` for comprehensive analysis
- Use `"quick"` for faster iteration during testing
- Use `"vocabulary"` or `"syntax"` for specific insights

**4. Interpreting Results**
- Focus on Tier 1 function words (highest discriminative power)
- British markers indicate regional style
- High first-person usage = personal/authority voice
- Low modal verb usage = less hedging/uncertainty

---

## Troubleshooting

**Issue: "No corpus found"**
- Run `collect_corpus` first
- Check corpus name matches exactly
- Verify `corpus/` directory exists

**Issue: "Not enough data"**
- Collect more articles (min 20)
- Check articles aren't empty
- Verify markdown extraction worked

**Issue: "Z-scores all near zero"**
- This is unusual - indicates very typical English usage
- May indicate corpus is too generic/averaged
- Consider collecting more distinctive content

---

## Next Steps

**Phase 2** (Coming soon):
- Character n-gram analysis (contractions, punctuation patterns)
- Word n-gram analysis (phrase patterns)
- POS n-gram analysis (syntactic fingerprinting)
- Enhanced discrimination scoring

**Phase 3**:
- Contrastive examples in guide output
- "Good vs Bad" writing samples
- Enhanced LLM instruction format

**Phase 4**:
- Real-time validation tools
- Delta-based content checking
- Automated voice drift detection

---

## Support

For issues or questions:
1. Check `IMPLEMENTATION-PROGRESS.md` for current status
2. Review `research/` directory for technical details
3. Open issue in repository
