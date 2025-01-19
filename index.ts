import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";
import JSON5 from "json5";
import { marked } from "marked";
import type { Plugin } from "vite";

/**
 * Configuration options for the JSON-Markdown plugin
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
}

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
 *       convertToJson: true
 *     })
 *   ]
 * })
 * ```
 */
export function jsonMdPlugin(options: JsonMdPluginOptions): Plugin {
  const {
    sourceDir = "",
    inputFiles,
    markdownDir,
    outputDir,
    parseMarkdown = true,
    convertToJson = false,
    minify = false,
  } = options;

  return {
    name: "vite-plugin-json-md",
    async buildStart() {
      // Resolve all input files using glob patterns
      const resolvedFiles = await Promise.all(
        inputFiles.map((pattern) =>
          glob(path.join(sourceDir, pattern), { absolute: true }),
        ),
      ).then((results) => results.flat());

      for (const filePath of resolvedFiles) {
        const content = fs.readFileSync(filePath, "utf-8");
        const json = JSON5.parse(content);

        // Process markdown content in JSON
        processJsonTree(json);

        const stringify = convertToJson ? JSON.stringify : JSON5.stringify;
        const relativePath = path.relative(sourceDir, filePath);
        const outputPath = path.join(path.resolve(outputDir), relativePath);

        // Convert file extension if outputting as JSON
        const finalOutputPath = convertToJson
          ? outputPath.replace(/\.(json5|jsonc)$/, ".json")
          : outputPath;

        // Ensure output directory exists
        fs.mkdirSync(path.dirname(finalOutputPath), { recursive: true });

        // Write processed file
        fs.writeFileSync(
          finalOutputPath,
          minify ? stringify(json) : stringify(json, null, 2),
        );
      }
    },
  };

  /**
   * Recursively processes markdown content in JSON object
   */
  function processJsonTree(obj: Record<string, any>): void {
    if (typeof obj === "object" && obj !== null) {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "string" && obj[key].startsWith("md:")) {
          obj[key] = processMarkdown(obj[key]);
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          processJsonTree(obj[key]);
        }
      });
    }
  }

  /**
   * Processes markdown content, either inline or from external file
   */
  function processMarkdown(content: string): string {
    // Handle external markdown files
    if (content.startsWith("md:@")) {
      const mdPath = path.join(markdownDir, content.slice(4));
      const mdContent = fs.readFileSync(mdPath, "utf-8");
      return parseMarkdown ? (marked(mdContent) as string) : mdContent;
    }
    // Handle inline markdown
    return parseMarkdown
      ? (marked(content.slice(3)) as string)
      : content.slice(3);
  }
}
