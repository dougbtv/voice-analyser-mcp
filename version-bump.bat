@echo off
cd /d C:\dev\content-machine\mcp-server-voice-analysis
git add package.json
git commit -m "chore: bump version to 1.1.0 for v2.0 anti-detection release"
git tag v1.1.0
