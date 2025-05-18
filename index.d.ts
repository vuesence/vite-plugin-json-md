import type { Plugin } from 'vite';

/**
 * Options for the JSON-MD Vite plugin
 */
export interface JsonMdPluginOptions {
  /**
   * Source directory containing JSON/JSON5 files to process
   * @default ""
   */
  sourceDir?: string;

  /**
   * Glob patterns for JSON/JSON5 files to process
   * @example ["en/*.json5", "fr/*.json5"]
   */
  inputFiles: string[];

  /**
   * Directory containing markdown files referenced in JSON
   */
  markdownDir: string;

  /**
   * Output directory for processed files
   */
  outputDir: string;

  /**
   * Whether to parse markdown content into HTML
   * @default true
   */
  parseMarkdown?: boolean;

  /**
   * Whether to convert JSON5/JSONC to standard JSON
   * @default false
   */
  convertToJson?: boolean;

  /**
   * Whether to minify output files
   * @default false
   */
  minify?: boolean;

  /**
   * Whether to add target="_blank" rel="noopener noreferrer" to all links
   * @default false
   */
  externalLinks?: boolean;
}

/**
 * Recursively processes markdown content in JSON object
 */
export function traverseJsonNodes(
  jsonObject: Record<string, any>,
  markdownDir: string,
  parseMarkdown?: boolean,
  externalLinks?: boolean
): void;

/**
 * Vite plugin that processes JSON5/JSONC files and converts markdown content.
 * Supports:
 * - Converting JSON5/JSONC to standard JSON
 * - Processing inline markdown with "md:" prefix
 * - Including external markdown files with "md:@" prefix
 * - Minification of output files
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { jsonMdPlugin } from 'vite-plugin-json-md'
 *
 * export default defineConfig({
 *   plugins: [
 *     jsonMdPlugin({
 *       sourceDir: 'src/locales',
 *       inputFiles: ['en/*.json5', 'fr/*.json5'],
 *       markdownDir: 'src/locales/md',
 *       outputDir: 'src/locales/out',
 *       parseMarkdown: true,
 *       convertToJson: true,
 *       externalLinks: true
 *     })
 *   ]
 * })
 * ```
 */
export function jsonMdPlugin(options: JsonMdPluginOptions): Plugin;