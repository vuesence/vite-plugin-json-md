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

  /**
   * Whether to add target="_blank" rel="noopener noreferrer" to all links
   * @default false
   */
  externalLinks?: boolean;
}

/**
 * Vite plugin that processes JSON5/JSONC files and converts markdown content.
 * Supports:
 * - Converting JSON5/JSONC to standard JSON
 * - Processing inline markdown with "md:" prefix
 * - Including external markdown files with "md:@" prefix
 * - Minification of output files
 * - Opening links in a new tab (target="_blank")
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
export function jsonMdPlugin(options: JsonMdPluginOptions): Plugin {
  const {
    sourceDir = "",
    inputFiles,
    markdownDir,
    outputDir,
    parseMarkdown = true,
    convertToJson = true,
    minify = false,
    externalLinks = false,
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
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const parsedData = JSON5.parse(fileContent);

        // Обработка markdown в JSON
        traverseJsonNodes(parsedData, markdownDir, parseMarkdown, externalLinks);

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
          minify ? stringify(parsedData) : stringify(parsedData, null, 2),
        );
      }
    },
  };
}

/**
 * Recursively processes markdown content in JSON object
 */
export function traverseJsonNodes(
  jsonObject: Record<string, any>,
  markdownDir: string,
  parseMarkdown: boolean = true,
  externalLinks: boolean = false,
): void {
  if (typeof jsonObject === "object" && jsonObject !== null) {
    Object.keys(jsonObject).forEach((propertyKey) => {
      if (
        typeof jsonObject[propertyKey] === "string" &&
        jsonObject[propertyKey].startsWith("md:")
      ) {
        jsonObject[propertyKey] = handleMarkdownContent(
          jsonObject[propertyKey],
          markdownDir,
          parseMarkdown,
          externalLinks,
        );
      } else if (
        typeof jsonObject[propertyKey] === "object" &&
        jsonObject[propertyKey] !== null
      ) {
        traverseJsonNodes(jsonObject[propertyKey], markdownDir, parseMarkdown, externalLinks);
      }
    });
  }
}

/**
 * Processes markdown content, either inline or from external file
 */
function handleMarkdownContent(
  content: string,
  markdownDir: string,
  parseMarkdown: boolean,
  externalLinks: boolean = false,
): string {
  let mdContent: string;
  
  // Handle external markdown files
  if (content.startsWith("md:@")) {
    const mdPath = path.join(markdownDir, content.slice(4));
    mdContent = fs.readFileSync(mdPath, "utf-8");
  } else {
    // Handle inline markdown
    mdContent = content.slice(3);
  }
  
  if (!parseMarkdown) {
    return mdContent;
  }
  
  if (externalLinks) {
    const renderer = new marked.Renderer();

    renderer.link = function({ href, title, text }) {
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" ${
        title ? `title="${title}"` : ""
      }>${text}</a>`;
    };
    marked.setOptions({ renderer });
  }
  // Parse markdown to HTML
  
  // If external links option is enabled, add target="_blank" and rel="noopener noreferrer" to all links
  // Use a simple string replacement for all <a> tags
  // html = html.replace(/<a\s+/g, '<a target="_blank" rel="noopener noreferrer" ');
  let html = marked.parse(mdContent) as string;
  
  return html;
}
