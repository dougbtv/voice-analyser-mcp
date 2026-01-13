/**
 * Test script for v2.0 analyzer integration
 */

import { analyzeCorpus } from './dist/tools/analyze-corpus.js';

async function test() {
  console.log('Testing v2.0 analyzer integration...\n');
  
  try {
    const result = await analyzeCorpus({
      corpus_name: 'test-corpus',
      analysis_type: 'full'
    });
    
    console.log('✅ Analysis complete!');
    console.log(`   Corpus: ${result.corpus_name}`);
    console.log(`   Output: ${result.analysis_path}`);
    console.log('\nCheck the analysis directory for v2.0 JSON files:');
    console.log('   - lexical-diversity.json');
    console.log('   - syntactic-patterns.json');
    console.log('   - expression-markers.json');
    console.log('   - clustering-patterns.json');
    console.log('   - detection-risk.json');
    console.log('   - detection-risk-summary.md');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();