/**
 * AI detection risk assessment
 * Combines all analysis metrics to evaluate detection risk
 * Based on peer-reviewed research (CMU PNAS 2025, AAAI 2025)
 */

export interface DetectionRisk {
  metric: string;
  corpusValue: number;
  typicalAIValue: number;
  humanBenchmark: number;
  deviation: number; // How far from AI typical (positive = good)
  riskLevel: 'safe' | 'moderate' | 'high';
  recommendation: string;
  category: 'lexical' | 'syntactic' | 'structural' | 'expression';
}

export interface DetectionRiskReport {
  overallRisk: 'safe' | 'moderate' | 'high';
  riskScore: number; // 0-100 (lower is better, <30 = safe)
  criticalFactors: DetectionRisk[];
  allFactors: DetectionRisk[];
  summary: string;
  actionItems: string[];
}

/**
 * AI benchmark values from research
 * Sources: CMU PNAS 2025, AAAI 2025, ResearchGate 2023
 */
const AI_BENCHMARKS = {
  // Lexical metrics
  typeTokenRatio: 0.45, // AI: lower diversity
  hapaxRate: 20.0, // AI: fewer unique words (per 100)
  bigramUniqueness: 0.68, // AI: more repeated phrases
  
  // Syntactic patterns
  presentParticipleRate: 1.0, // AI: 2-5x human rate (per 100 words)
  nominalizationRate: 1.3, // AI: 1.5-2x human rate (per 100 words)
  agentlessPassiveRate: 0.3, // AI: ~50% of human rate (per sentence)
  
  // Structural patterns
  burstiness: -0.15, // AI: uniform distribution (negative = uniform)
  sentenceLengthStdDev: 8.0, // AI: less variation
  
  // Expression markers
  fragmentRate: 0.5, // AI: very rare (per 100 sentences)
  asideRate: 1.0, // AI: avoids parentheticals (per 100 sentences)
};

const HUMAN_BENCHMARKS = {
  // Lexical metrics
  typeTokenRatio: 0.60,
  hapaxRate: 35.0,
  bigramUniqueness: 0.82,
  
  // Syntactic patterns
  presentParticipleRate: 0.4,
  nominalizationRate: 0.8,
  agentlessPassiveRate: 0.6,
  
  // Structural patterns
  burstiness: 0.35,
  sentenceLengthStdDev: 12.0,
  
  // Expression markers
  fragmentRate: 5.0,
  asideRate: 8.0,
};

/**
 * Calculate overall detection risk from analysis results
 */
export function calculateDetectionRisk(
  lexical: any,
  syntactic: any,
  structural: any,
  expression: any
): DetectionRiskReport {
  const risks: DetectionRisk[] = [];
  
  // Lexical diversity risks
  risks.push({
    metric: 'Type-Token Ratio (Lexical Diversity)',
    corpusValue: lexical.typeTokenRatio,
    typicalAIValue: AI_BENCHMARKS.typeTokenRatio,
    humanBenchmark: HUMAN_BENCHMARKS.typeTokenRatio,
    deviation: lexical.typeTokenRatio / AI_BENCHMARKS.typeTokenRatio,
    riskLevel: assessRisk(
      lexical.typeTokenRatio,
      AI_BENCHMARKS.typeTokenRatio,
      'increase'
    ),
    recommendation: lexical.typeTokenRatio < AI_BENCHMARKS.typeTokenRatio * 1.1
      ? 'INCREASE vocabulary diversity. Use more unique words, avoid repetition.'
      : 'Lexical diversity is above AI typical. Good differentiation.',
    category: 'lexical'
  });
  
  risks.push({
    metric: 'Hapax Legomena (Unique Word Usage)',
    corpusValue: lexical.hapaxLegomena.rate,
    typicalAIValue: AI_BENCHMARKS.hapaxRate,
    humanBenchmark: HUMAN_BENCHMARKS.hapaxRate,
    deviation: lexical.hapaxLegomena.rate / AI_BENCHMARKS.hapaxRate,
    riskLevel: assessRisk(
      lexical.hapaxLegomena.rate,
      AI_BENCHMARKS.hapaxRate,
      'increase'
    ),
    recommendation: lexical.hapaxLegomena.rate < AI_BENCHMARKS.hapaxRate * 1.2
      ? 'INCREASE one-time word usage. AI reuses vocabulary more than humans.'
      : 'Unique word usage is strong. Natural pattern.',
    category: 'lexical'
  });
  
  // Syntactic pattern risks
  risks.push({
    metric: 'Present Participles (-ing forms)',
    corpusValue: syntactic.presentParticiples.rate,
    typicalAIValue: AI_BENCHMARKS.presentParticipleRate,
    humanBenchmark: HUMAN_BENCHMARKS.presentParticipleRate,
    deviation: AI_BENCHMARKS.presentParticipleRate / syntactic.presentParticiples.rate,
    riskLevel: syntactic.presentParticiples.detectionRisk,
    recommendation: syntactic.presentParticiples.guidance,
    category: 'syntactic'
  });
  
  risks.push({
    metric: 'Nominalizations (Abstract Nouns)',
    corpusValue: syntactic.nominalizations.rate,
    typicalAIValue: AI_BENCHMARKS.nominalizationRate,
    humanBenchmark: HUMAN_BENCHMARKS.nominalizationRate,
    deviation: AI_BENCHMARKS.nominalizationRate / syntactic.nominalizations.rate,
    riskLevel: syntactic.nominalizations.detectionRisk,
    recommendation: syntactic.nominalizations.guidance,
    category: 'syntactic'
  });
  
  risks.push({
    metric: 'Agentless Passive Voice',
    corpusValue: syntactic.passiveVoice.agentlessRate,
    typicalAIValue: AI_BENCHMARKS.agentlessPassiveRate,
    humanBenchmark: HUMAN_BENCHMARKS.agentlessPassiveRate,
    deviation: syntactic.passiveVoice.agentlessRate / AI_BENCHMARKS.agentlessPassiveRate,
    riskLevel: syntactic.passiveVoice.detectionRisk,
    recommendation: syntactic.passiveVoice.guidance,
    category: 'syntactic'
  });
  
  // Structural pattern risks
  risks.push({
    metric: 'Burstiness Coefficient (Clustering)',
    corpusValue: structural.sentenceLengthClusters.burstiness,
    typicalAIValue: AI_BENCHMARKS.burstiness,
    humanBenchmark: HUMAN_BENCHMARKS.burstiness,
    deviation: structural.sentenceLengthClusters.burstiness - AI_BENCHMARKS.burstiness,
    riskLevel: structural.sentenceLengthClusters.burstiness < 0 ? 'high' :
               structural.sentenceLengthClusters.burstiness < 0.2 ? 'moderate' : 'safe',
    recommendation: structural.sentenceLengthClusters.guidance,
    category: 'structural'
  });
  
  risks.push({
    metric: 'Sentence Length Variation',
    corpusValue: structural.lengthVariation.stdDev,
    typicalAIValue: AI_BENCHMARKS.sentenceLengthStdDev,
    humanBenchmark: HUMAN_BENCHMARKS.sentenceLengthStdDev,
    deviation: structural.lengthVariation.stdDev / AI_BENCHMARKS.sentenceLengthStdDev,
    riskLevel: assessRisk(
      structural.lengthVariation.stdDev,
      AI_BENCHMARKS.sentenceLengthStdDev,
      'increase'
    ),
    recommendation: structural.lengthVariation.guidance,
    category: 'structural'
  });
  
  // Expression marker risks
  risks.push({
    metric: 'Sentence Fragments',
    corpusValue: expression.fragments.rate,
    typicalAIValue: AI_BENCHMARKS.fragmentRate,
    humanBenchmark: HUMAN_BENCHMARKS.fragmentRate,
    deviation: expression.fragments.rate / AI_BENCHMARKS.fragmentRate,
    riskLevel: expression.fragments.detectionRisk,
    recommendation: expression.fragments.guidance,
    category: 'expression'
  });
  
  risks.push({
    metric: 'Mid-Sentence Asides',
    corpusValue: expression.midSentenceAsides.rate,
    typicalAIValue: AI_BENCHMARKS.asideRate,
    humanBenchmark: HUMAN_BENCHMARKS.asideRate,
    deviation: expression.midSentenceAsides.rate / AI_BENCHMARKS.asideRate,
    riskLevel: assessRisk(
      expression.midSentenceAsides.rate,
      AI_BENCHMARKS.asideRate,
      'increase'
    ),
    recommendation: expression.midSentenceAsides.guidance,
    category: 'expression'
  });
  
  // Calculate overall risk score
  const riskScore = calculateOverallRiskScore(risks);
  const overallRisk = riskScore < 30 ? 'safe' : riskScore < 60 ? 'moderate' : 'high';
  
  // Identify critical factors
  const criticalFactors = risks.filter(r => r.riskLevel === 'high');
  
  // Generate summary and action items
  const summary = generateSummary(overallRisk, riskScore, criticalFactors);
  const actionItems = generateActionItems(criticalFactors, risks);
  
  return {
    overallRisk,
    riskScore,
    criticalFactors,
    allFactors: risks,
    summary,
    actionItems
  };
}

/**
 * Assess risk level for a metric
 */
function assessRisk(
  corpusValue: number,
  aiTypical: number,
  direction: 'increase' | 'decrease'
): 'safe' | 'moderate' | 'high' {
  const ratio = corpusValue / aiTypical;
  
  if (direction === 'increase') {
    // Want to be ABOVE AI typical
    if (ratio < 0.9) return 'high';
    if (ratio < 1.2) return 'moderate';
    return 'safe';
  } else {
    // Want to be BELOW AI typical
    if (ratio > 1.3) return 'high';
    if (ratio > 1.1) return 'moderate';
    return 'safe';
  }
}

/**
 * Calculate overall risk score (0-100)
 */
function calculateOverallRiskScore(risks: DetectionRisk[]): number {
  const weights = {
    high: 20,
    moderate: 10,
    safe: 0
  };
  
  let totalScore = 0;
  for (const risk of risks) {
    totalScore += weights[risk.riskLevel];
  }
  
  // Normalize to 0-100 scale
  const maxPossible = risks.length * weights.high;
  return (totalScore / maxPossible) * 100;
}

/**
 * Generate summary text
 */
function generateSummary(
  overallRisk: string,
  riskScore: number,
  criticalFactors: DetectionRisk[]
): string {
  if (overallRisk === 'safe') {
    return `✅ LOW DETECTION RISK (score: ${riskScore.toFixed(0)}/100). Writing exhibits strong human patterns across most metrics. Continue current approach.`;
  }
  
  if (overallRisk === 'moderate') {
    return `⚠️ MODERATE DETECTION RISK (score: ${riskScore.toFixed(0)}/100). ${criticalFactors.length} critical factors identified. Address high-risk areas for better differentiation.`;
  }
  
  return `❌ HIGH DETECTION RISK (score: ${riskScore.toFixed(0)}/100). ${criticalFactors.length} critical factors show AI patterns. Immediate changes required across multiple dimensions.`;
}

/**
 * Generate actionable recommendations
 */
function generateActionItems(
  criticalFactors: DetectionRisk[],
  allRisks: DetectionRisk[]
): string[] {
  const items: string[] = [];
  
  // Priority 1: Critical factors
  if (criticalFactors.length > 0) {
    items.push('🔴 CRITICAL PRIORITIES:');
    for (const risk of criticalFactors) {
      items.push(`  • ${risk.metric}: ${risk.recommendation}`);
    }
  }
  
  // Priority 2: Moderate risks
  const moderateRisks = allRisks.filter(r => r.riskLevel === 'moderate');
  if (moderateRisks.length > 0) {
    items.push('');
    items.push('🟡 MODERATE IMPROVEMENTS:');
    for (const risk of moderateRisks) {
      items.push(`  • ${risk.metric}: ${risk.recommendation}`);
    }
  }
  
  return items;
}
