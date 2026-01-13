# Voice Analyzer v2.0 - Phase 2 Handover
## Integration Tasks for New Anti-Detection Analyzers

**Status:** Phase 1 Complete ✅ (Core analyzers built and tested)  
**Next:** Phase 2 - Integration with existing MCP tools

---

## PHASE 1 SUMMARY: WHAT WAS BUILT

### New Utility Functions
**File:** `src/utils/advanced-statistics.ts`

```typescript
// Clustering & burstiness
export function burstiness(values: number[]): number
export function detectClusters(values: number[], threshold?: number, minSize?: number): Cluster[]

// Lexical diversity
export function typeTokenRatio(tokens: string[]): number
export function movingAvgTypeTokenRatio(tokens: string[], windowSize?: number): number
export function hapaxLegomenaCount(tokens: string[]): number
export function bigramUniqueness(tokens: string[]): number

// Distribution analysis
export function entropy<T>(items: T[]): number
export function categorizedDistribution<T>(...): DistributionBucket<T>[]
```

### New Analyzers

#### 1. Lexical Diversity Analyzer
**File:** `src/analyzers/lexical-diversity.ts`

```typescript
export interface LexicalDiversityAnalysis {
  totalWords: number;
  uniqueWords: number;
  typeTokenRatio: number;
  movingAvgTTR: number;
  hapaxLegomena: { count: number; rate: number };
  bigramUniqueness: number;
  vocabularySize: number;
  difficultWords: { count: number; rate: number; examples: string[] };
  aiDetectionContext: {
    ttrGuidance: string;
    hapaxGuidance: string;
    bigramGuidance: string;
  };
}

export function analyzeLexicalDiversity(text: string): LexicalDiversityAnalysis
```

**Purpose:** Detects vocabulary richness patterns. AI typically has LOWER diversity.

---

#### 2. Syntactic Patterns Analyzer
**File:** `src/analyzers/syntactic-patterns.ts`

```typescript
export interface SyntacticPatternAnalysis {
  presentParticiples: {
    count: number;
    rate: number;
    examples: string[];
    detectionRisk: 'safe' | 'moderate' | 'high';
    guidance: string;
  };
  nominalizations: { /* same structure */ };
  passiveVoice: {
    total: number;
    agentless: number;
    agentlessRate: number;
    examples: string[];
    detectionRisk: 'safe' | 'moderate' | 'high';
    guidance: string;
  };
  posRatios: {
    adjectives: number;
    adverbs: number;
    nouns: number;
    verbs: number;
    determiners: number;
    prepositions: number;
  };
}

export function analyzeSyntacticPatterns(text: string): SyntacticPatternAnalysis
```

**Purpose:** Detects grammatical structures. AI over-uses participles and nominalizations.

**Dependencies:** Uses `compromise` (already installed)

---

#### 3. Expression Markers Analyzer
**File:** `src/analyzers/expression-markers.ts`

```typescript
export interface ExpressionMarkerAnalysis {
  fragments: {
    count: number;
    rate: number;
    examples: string[];
    detectionRisk: 'safe' | 'moderate' | 'high';
    guidance: string;
  };
  rhetoricalQuestions: { /* similar */ };
  midSentenceAsides: {
    count: number;
    rate: number;
    types: { parenthetical: number; dashes: number; commaAsides: number };
    examples: string[];
    guidance: string;
  };
  contractions: { count: number; rate: number; examples: string[] };
  hedgingPhrases: { /* similar */ };
  emphaticMarkers: { /* similar */ };
}

export function analyzeExpressionMarkers(text: string): ExpressionMarkerAnalysis
```

**Purpose:** Detects personal/stylistic elements. AI rarely uses fragments or asides.

**Dependencies:** Uses `compromise` (already installed)

---

#### 4. Clustering Analyzer
**File:** `src/analyzers/clustering.ts`

```typescript
export interface ClusteringAnalysis {
  sentenceLengthClusters: {
    clusters: Cluster[];
    avgClusterSize: number;
    burstiness: number; // -1 (uniform) to +1 (bursty)
    distribution: DistributionBucket<string>[];
    guidance: string;
  };
  paragraphOpenings: {
    types: Record<string, number>;
    entropy: number;
    examples: Record<string, string[]>;
    guidance: string;
  };
  lengthVariation: {
    mean: number;
    stdDev: number;
    coefficientOfVariation: number;
    guidance: string;
  };
}

export function analyzeClusteringPatterns(text: string): ClusteringAnalysis
```

**Purpose:** **THE KEY METRIC.** Detects uniform vs bursty writing. AI writes uniformly.

**Dependencies:** Uses `src/utils/advanced-statistics.ts`

---

#### 5. Detection Risk Assessment
**File:** `src/analyzers/detection-risk.ts`

```typescript
export interface DetectionRiskReport {
  overallRisk: 'safe' | 'moderate' | 'high';
  riskScore: number; // 0-100 (lower is better, <30 = safe)
  criticalFactors: DetectionRisk[];
  allFactors: DetectionRisk[];
  summary: string;
  actionItems: string[];
}

export function calculateDetectionRisk(
  lexical: LexicalDiversityAnalysis,
  syntactic: SyntacticPatternAnalysis,
  structural: ClusteringAnalysis,
  expression: ExpressionMarkerAnalysis
): DetectionRiskReport
```

**Purpose:** Combines all metrics into overall risk assessment with recommendations.

**Dependencies:** Requires results from all 4 other analyzers

---

## PHASE 2 TASKS: INTEGRATION CHECKLIST

### Task 1: Update `analyze_corpus` Tool
**File to modify:** `src/tools/analyze-corpus.ts`

**Current behavior:** Analyzes sentences, vocabulary, voice markers, etc.

**Required changes:**

#### 1.1 Import New Analyzers
```typescript
// Add these imports at top of file
import { analyzeLexicalDiversity } from '../analyzers/lexical-diversity.js';
import { analyzeSyntacticPatterns } from '../analyzers/syntactic-patterns.js';
import { analyzeExpressionMarkers } from '../analyzers/expression-markers.js';
import { analyzeClusteringPatterns } from '../analyzers/clustering.js';
import { calculateDetectionRisk } from '../analyzers/detection-risk.js';
```

#### 1.2 Add to Analysis Interface
Find the existing analysis result interface and add:

```typescript
export interface CorpusAnalysisResult {
  // ... existing fields (sentences, vocabulary, etc.)
  
  // NEW v2.0 FIELDS:
  lexicalDiversity?: LexicalDiversityAnalysis;
  syntacticPatterns?: SyntacticPatternAnalysis;
  expressionMarkers?: ExpressionMarkerAnalysis;
  clusteringPatterns?: ClusteringAnalysis;
  detectionRisk?: DetectionRiskReport;
}
```

#### 1.3 Run New Analyzers
Inside `analyzeCorpus()` function, add after existing analyses:

```typescript
// Run v2.0 anti-detection analyzers
console.error('Running v2.0 anti-detection analysis...');

const lexicalDiversity = analyzeLexicalDiversity(cleanText);
const syntacticPatterns = analyzeSyntacticPatterns(cleanText);
const expressionMarkers = analyzeExpressionMarkers(cleanText);
const clusteringPatterns = analyzeClusteringPatterns(cleanText);

// Calculate overall detection risk
const detectionRisk = calculateDetectionRisk(
  lexicalDiversity,
  syntacticPatterns,
  clusteringPatterns,
  expressionMarkers
);

// Add to result object
result.lexicalDiversity = lexicalDiversity;
result.syntacticPatterns = syntacticPatterns;
result.expressionMarkers = expressionMarkers;
result.clusteringPatterns = clusteringPatterns;
result.detectionRisk = detectionRisk;
```

---

### Task 2: Create New MCP Tool (Optional)
**File to create:** `src/tools/analyze-detection-risk.ts`

**Purpose:** Standalone tool for detection risk analysis (if you want it separate)

```typescript
export interface DetectionRiskParams {
  corpus_name: string;
}

export async function analyzeDetectionRisk(params: DetectionRiskParams) {
  // Load corpus
  const corpus = await loadCorpus(params.corpus_name);
  
  // Run all 4 analyzers
  const lexical = analyzeLexicalDiversity(corpus.text);
  const syntactic = analyzeSyntacticPatterns(corpus.text);
  const expression = analyzeExpressionMarkers(corpus.text);
  const clustering = analyzeClusteringPatterns(corpus.text);
  
  // Calculate risk
  const risk = calculateDetectionRisk(lexical, syntactic, clustering, expression);
  
  return {
    corpusName: params.corpus_name,
    analysisDate: new Date().toISOString(),
    risk
  };
}
```

**Then register in `src/index.ts`:**

```typescript
// In ListToolsRequestSchema handler, add:
{
  name: 'analyze_detection_risk',
  description: 'Analyze AI detection risk for corpus using v2.0 anti-detection metrics',
  inputSchema: {
    type: 'object',
    properties: {
      corpus_name: {
        type: 'string',
        description: 'Name of corpus to analyze for detection risk'
      }
    },
    required: ['corpus_name']
  }
}

// In CallToolRequestSchema handler, add:
case 'analyze_detection_risk': {
  const params = request.params.arguments as unknown as DetectionRiskParams;
  const result = await analyzeDetectionRisk(params);
  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
  };
}
```

---

### Task 3: Update Template Generation
**Files to modify:** 
- `src/tools/generate-guide.ts` (standard template)
- `src/tools/generate-enhanced-guide.ts` (enhanced template)

**Required changes:**

#### 3.1 Load v2.0 Analysis Results
```typescript
// In generateTovGuide() or generateEnhancedGuide()
// After loading corpus analysis:

const analysis = await loadAnalysis(params.corpus_name);

// Access v2.0 metrics
const lexical = analysis.lexicalDiversity;
const syntactic = analysis.syntacticPatterns;
const expression = analysis.expressionMarkers;
const clustering = analysis.clusteringPatterns;
const risk = analysis.detectionRisk;
```

#### 3.2 Add New Template Sections

**Section 1: Sentence Length Clustering (CRITICAL)**
```typescript
// Replace old "Sentence Length: Average X words" section with:

template += `
## Sentence Length: Clustering Pattern (NOT Uniform Distribution)

⚠️ **CRITICAL: AI Detection Risk**
${clustering.sentenceLengthClusters.guidance}

### Observed Distribution
${clustering.sentenceLengthClusters.distribution.map(bucket => 
  `- ${bucket.label}: ${bucket.percentage.toFixed(0)}% (${bucket.count} sentences)`
).join('\n')}

### Burstiness Coefficient: ${clustering.sentenceLengthClusters.burstiness.toFixed(2)}
- Range: -1 (perfectly uniform) to +1 (extremely bursty)
- AI typical: -0.15 (uniform)
- Human typical: 0.35 (bursty)

### How to Apply (CRITICAL):
1. Write 2-3 consecutive short sentences (8-12 words)
2. Follow with 1-2 long sentences (25-40 words)
3. Sprinkle fragments (<5 words) for emphasis
4. NEVER maintain same length for 4+ sentences

### Example Cluster Pattern:
${clustering.sentenceLengthClusters.clusters.slice(0, 2).map(cluster =>
  `Cluster of ${cluster.size} sentences: ${cluster.min}-${cluster.max} words (avg: ${cluster.mean.toFixed(1)})`
).join('\n')}
`;
```

**Section 2: AI Detection Avoidance Checklist**
```typescript
template += `
## AI Detection Avoidance Checklist

Overall Risk: ${risk.overallRisk.toUpperCase()} (score: ${risk.riskScore.toFixed(0)}/100)
${risk.summary}

### ❌ CRITICAL RISKS (Fix Immediately):
${risk.criticalFactors.map(factor =>
  `- **${factor.metric}**: ${factor.recommendation}`
).join('\n')}

### Action Items:
${risk.actionItems.join('\n')}

### Metrics Comparison (Corpus vs AI Typical):
${risk.allFactors.map(factor => {
  const ratio = (factor.corpusValue / factor.typicalAIValue).toFixed(2);
  const status = factor.riskLevel === 'safe' ? '✅' :
                 factor.riskLevel === 'moderate' ? '⚠️' : '❌';
  return `${status} ${factor.metric}: ${ratio}x AI typical`;
}).join('\n')}
`;
```

**Section 3: Expression Markers**
```typescript
template += `
## Expression Markers (Human Patterns)

### Sentence Fragments
- Rate: ${expression.fragments.rate.toFixed(1)}% (${expression.fragments.count} fragments)
- ${expression.fragments.guidance}
- Examples: ${expression.fragments.examples.slice(0, 3).join(' | ')}

### Mid-Sentence Asides
- Rate: ${expression.midSentenceAsides.rate.toFixed(1)}%
- Types: ${expression.midSentenceAsides.types.parenthetical} parenthetical, ${expression.midSentenceAsides.types.dashes} dashes
- ${expression.midSentenceAsides.guidance}

### Contractions
- Rate: ${expression.contractions.rate.toFixed(2)} per 100 words
- Examples: ${expression.contractions.examples.slice(0, 10).join(', ')}
`;
```

**Section 4: Syntactic Pattern Warnings**
```typescript
template += `
## Syntactic Pattern Warnings

### Present Participles (-ing verbs)
- ${syntactic.presentParticiples.detectionRisk.toUpperCase()}: ${syntactic.presentParticiples.guidance}
- Rate: ${syntactic.presentParticiples.rate.toFixed(2)}% (${syntactic.presentParticiples.count} occurrences)

### Nominalizations (Abstract Nouns)
- ${syntactic.nominalizations.detectionRisk.toUpperCase()}: ${syntactic.nominalizations.guidance}
- Rate: ${syntactic.nominalizations.rate.toFixed(2)}%

### Passive Voice
- Agentless passive: ${syntactic.passiveVoice.agentlessRate.toFixed(2)}% of sentences
- ${syntactic.passiveVoice.detectionRisk.toUpperCase()}: ${syntactic.passiveVoice.guidance}
`;
```

---

### Task 4: Update JSON Output Schema
**File:** `src/tools/analyze-corpus.ts`

Ensure the saved analysis JSON includes all new fields:

```typescript
const analysisOutput = {
  version: '2.0.0', // Update version number
  analyzedAt: new Date().toISOString(),
  corpusInfo: { /* ... */ },
  
  // Existing analyses
  sentences: sentenceAnalysis,
  vocabulary: vocabularyAnalysis,
  // ... other existing fields
  
  // NEW v2.0 fields
  lexicalDiversity: lexicalDiversity,
  syntacticPatterns: syntacticPatterns,
  expressionMarkers: expressionMarkers,
  clusteringPatterns: clusteringPatterns,
  detectionRisk: detectionRisk
};

// Save to: corpus/{corpus_name}/{corpus_name}-analysis-v2.json
```

---

### Task 5: Testing Strategy

#### 5.1 Unit Tests (Recommended)
Create `src/analyzers/__tests__/` directory with:

```typescript
// lexical-diversity.test.ts
import { analyzeLexicalDiversity } from '../lexical-diversity';

describe('Lexical Diversity Analyzer', () => {
  test('detects low diversity (AI-like)', () => {
    const repetitiveText = 'The cat sat. The cat walked. The cat jumped.';
    const result = analyzeLexicalDiversity(repetitiveText);
    expect(result.typeTokenRatio).toBeLessThan(0.5);
  });
  
  test('detects high diversity (human-like)', () => {
    const variedText = 'Felines perch gracefully. Animals wander curiously. Creatures leap energetically.';
    const result = analyzeLexicalDiversity(variedText);
    expect(result.typeTokenRatio).toBeGreaterThan(0.7);
  });
});
```

#### 5.2 Integration Test
```bash
# Run analysis on test corpus
npm run build
node dist/index.js analyze_corpus test-corpus

# Verify output includes new fields:
# - lexicalDiversity
# - syntacticPatterns
# - expressionMarkers
# - clusteringPatterns
# - detectionRisk
```

#### 5.3 Template Generation Test
```bash
# Generate template with v2.0 metrics
node dist/index.js generate_enhanced_guide test-corpus

# Verify output includes:
# - "Clustering Pattern" section
# - "AI Detection Avoidance Checklist"
# - Burstiness coefficient
# - Detection risk score
```

---

## IMPLEMENTATION ORDER (RECOMMENDED)

1. **Task 1** (30 min): Update `analyze-corpus.ts` - run new analyzers
2. **Task 4** (15 min): Update JSON output schema
3. **Test** (15 min): Run analysis on existing corpus, verify JSON output
4. **Task 3** (60 min): Update template generation with new sections
5. **Test** (15 min): Generate template, verify all sections present
6. **Task 2** (30 min): Optional - create standalone detection risk tool
7. **Task 5** (optional): Add unit tests

**Total estimated time:** 2-3 hours for core integration

---

## VALIDATION CHECKLIST

Before considering Phase 2 complete:

- [ ] `analyze_corpus` tool runs all 5 new analyzers
- [ ] JSON output includes all v2.0 fields
- [ ] Template generation includes clustering guidance
- [ ] Template generation includes detection risk checklist
- [ ] Burstiness coefficient is calculated and displayed
- [ ] Detection risk score is calculated (0-100)
- [ ] Critical factors are identified and highlighted
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] Tested on real corpus with >10k words

---

## EXAMPLE OUTPUT STRUCTURE

After Phase 2 integration, running:
```bash
node dist/index.js analyze_corpus my-corpus
```

Should output JSON like:
```json
{
  "version": "2.0.0",
  "corpusInfo": { /* ... */ },
  "sentences": { /* existing */ },
  "vocabulary": { /* existing */ },
  "lexicalDiversity": {
    "typeTokenRatio": 0.58,
    "hapaxLegomena": { "rate": 32.4 },
    "aiDetectionContext": {
      "ttrGuidance": "HIGH diversity (human-like). Corpus demonstrates rich vocabulary variation."
    }
  },
  "clusteringPatterns": {
    "sentenceLengthClusters": {
      "burstiness": 0.42,
      "guidance": "✅ SAFE: Burstiness 0.42 shows natural clustering..."
    }
  },
  "detectionRisk": {
    "overallRisk": "safe",
    "riskScore": 24,
    "criticalFactors": [],
    "summary": "✅ LOW DETECTION RISK (score: 24/100). Writing exhibits strong human patterns..."
  }
}
```

---

## TROUBLESHOOTING

### Issue: TypeScript errors on new imports
**Solution:** Run `npm install` to ensure all dependencies are present, then `npm run build`

### Issue: "Cannot find module" errors
**Solution:** Check import paths end with `.js` (ES modules require extension)

### Issue: compromise.js errors
**Solution:** Already installed in package.json, but verify: `npm list compromise`

### Issue: Burstiness returning NaN
**Solution:** Ensure sentence array has >1 element before calling `burstiness()`

### Issue: Detection risk calculation fails
**Solution:** Verify all 4 analyzer results are passed to `calculateDetectionRisk()`

---

## QUESTIONS TO RESOLVE DURING PHASE 2

1. **Should detection risk be a separate tool?** Or just included in `analyze_corpus`?
   - **Recommendation:** Include in `analyze_corpus` by default (simpler UX)

2. **Should old template format be deprecated?** Or keep both?
   - **Recommendation:** Keep both, add `template_version` parameter

3. **What's the default analysis type?** Quick, full, or v2.0-only?
   - **Recommendation:** Default to `'full'` which includes everything

4. **Should we version the corpus analysis files?**
   - **Recommendation:** Yes - save as `{corpus}-analysis-v2.json`

---

## NEXT PHASE (Phase 3)

After Phase 2 integration complete, Phase 3 will focus on:
- Validation testing with real AI detectors
- Benchmark refinement based on detection results
- Template optimization based on user feedback
- Documentation and examples

---

**Phase 2 Developer:** Questions? Check existing analyzer implementations in `src/analyzers/` for patterns. All new analyzers follow same structure: `analyze*()` function returns interface with `guidance` strings.

**Good luck! 🚀**
