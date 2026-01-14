#!/usr/bin/env node

/**
 * Voice Analysis MCP Server
 * Automatic tone-of-voice analysis from published writing corpus
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';

import { collectCorpus, CollectCorpusParams } from './tools/collect-corpus.js';
import { analyzeCorpus, AnalyzeCorpusParams } from './tools/analyze-corpus.js';
import { generateTovGuide, GenerateTovGuideParams } from './tools/generate-guide.js';
import { generateEnhancedGuide, EnhancedGuideParams } from './tools/generate-enhanced-guide.js';
import { getVoiceGuide, GetVoiceGuideParams } from './tools/get-voice-guide.js';

const server = new Server(
  {
    name: 'voice-analysis-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'collect_corpus',
      description: 'Crawl sitemap and collect clean writing corpus from published articles',
      inputSchema: {
        type: 'object',
        properties: {
          sitemap_url: {
            type: 'string',
            description: 'URL to XML sitemap (e.g., https://example.com/post-sitemap.xml)'
          },
          output_name: {
            type: 'string',
            description: 'Corpus identifier/name (e.g., "richard-baxter")'
          },
          max_articles: {
            type: 'number',
            description: 'Maximum articles to process (default: 100)',
            default: 100
          },
          article_pattern: {
            type: 'string',
            description: 'Optional regex to filter URLs'
          }
        },
        required: ['sitemap_url', 'output_name'],
      },
    },
    {
      name: 'analyze_corpus',
      description: 'Perform linguistic analysis on collected corpus (vocabulary, sentence structure, voice markers)',
      inputSchema: {
        type: 'object',
        properties: {
          corpus_name: {
            type: 'string',
            description: 'Name of corpus to analyze'
          },
          analysis_type: {
            type: 'string',
            enum: ['full', 'quick', 'vocabulary', 'syntax'],
            description: 'Type of analysis to perform (default: full)',
            default: 'full'
          },
        },
        required: ['corpus_name'],
      },
    },
    {
      name: 'generate_tov_guide',
      description: 'Generate tone-of-voice guide from analysis results (LLM-optimized statistical model)',
      inputSchema: {
        type: 'object',
        properties: {
          corpus_name: {
            type: 'string',
            description: 'Name of analyzed corpus'
          },
          output_format: {
            type: 'string',
            enum: ['llm', 'human', 'both'],
            description: 'Output format (default: both)',
            default: 'both'
          },
          template: {
            type: 'string',
            enum: ['minimal', 'standard', 'comprehensive'],
            description: 'Guide template (default: standard)',
            default: 'standard'
          }
        },
        required: ['corpus_name'],
      },
    },
    {
      name: 'generate_enhanced_guide',
      description: 'Generate ENHANCED tone-of-voice guide integrating all n-gram patterns (character, word, POS) with function words and traditional metrics. Creates comprehensive LLM instruction set with contrastive examples.',
      inputSchema: {
        type: 'object',
        properties: {
          corpus_name: {
            type: 'string',
            description: 'Name of analyzed corpus'
          },
          output_format: {
            type: 'string',
            enum: ['llm', 'human', 'both'],
            description: 'Output format (default: both)',
            default: 'both'
          }
        },
        required: ['corpus_name'],
      },
    },
    {
      name: 'get_voice_guide',
      description: 'Retrieve generated voice guide for injection into context. Returns the voice guide in different formats for use in writing tasks.',
      inputSchema: {
        type: 'object',
        properties: {
          corpus_name: {
            type: 'string',
            description: 'Name of corpus to retrieve guide for'
          },
          format: {
            type: 'string',
            enum: ['full', 'quick-ref', 'core-patterns', 'anti-patterns'],
            description: 'Format to return: "full" (complete guide), "quick-ref" (metrics and forbidden list), "core-patterns" (identity, openings, voice markers), "anti-patterns" (what to avoid). Default: core-patterns',
            default: 'core-patterns'
          }
        },
        required: ['corpus_name'],
      },
    },
  ],
}));

// Tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case 'collect_corpus': {
        const params = request.params.arguments as unknown as CollectCorpusParams;
        const result = await collectCorpus(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
      
      case 'analyze_corpus': {
        const params = request.params.arguments as unknown as AnalyzeCorpusParams;
        const result = await analyzeCorpus(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
      
      case 'generate_tov_guide': {
        const params = request.params.arguments as unknown as GenerateTovGuideParams;
        const result = await generateTovGuide(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
      
      case 'generate_enhanced_guide': {
        const params = request.params.arguments as unknown as EnhancedGuideParams;
        const result = await generateEnhancedGuide(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'get_voice_guide': {
        const params = request.params.arguments as unknown as GetVoiceGuideParams;
        const result = await getVoiceGuide(params);

        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: result.error }, null, 2)
              }
            ]
          };
        }

        // Return the voice guide content directly as text for easy injection
        return {
          content: [
            {
              type: 'text',
              text: result.content
            }
          ]
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.exit(1);
});
