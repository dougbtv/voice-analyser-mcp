@echo off
cd /d C:\dev\content-machine\mcp-server-voice-analysis
git add src/utils/advanced-statistics.ts src/analyzers/lexical-diversity.ts src/analyzers/syntactic-patterns.ts src/analyzers/expression-markers.ts src/analyzers/clustering.ts src/analyzers/detection-risk.ts
git commit -m "Phase 1 complete: Core analyzers for v2.0 anti-detection metrics"
