/**
 * Path resolution utilities for MCP
 * Handles CORPUS_BASE_DIR environment variable to support working from any directory
 */

/**
 * Get the base directory for corpus storage
 * Checks CORPUS_BASE_DIR env var first, falls back to process.cwd()
 *
 * Set CORPUS_BASE_DIR in your MCP config to use a fixed corpus location:
 * ```json
 * {
 *   "mcpServers": {
 *     "voice-analysis": {
 *       "command": "node",
 *       "args": ["/path/to/dist/index.js"],
 *       "env": {
 *         "CORPUS_BASE_DIR": "/path/to/voice-analyser-mcp"
 *       }
 *     }
 *   }
 * }
 * ```
 */
export function getBaseDir(): string {
  return process.env.CORPUS_BASE_DIR || process.cwd();
}
