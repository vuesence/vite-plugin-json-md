import type { Plugin } from 'vite';

/**
 * Options for the JSON-MD Vite plugin
 */
export interface JsonMdPluginOptions {
  /**
   * Glob pattern for JSON files to process
   * @default '**\/*.json'
   */
  include?: string | string[];

  /**
   * Glob pattern for JSON files to exclude
   * @default []
   */
  exclude?: string | string[];

  /**
   * Custom markdown processing options
   */
  markdownOptions?: {
    /**
     * Whether to enable HTML rendering
     * @default true
     */
    html?: boolean;

    /**
     * Whether to enable breaks
     * @default false
     */
    breaks?: boolean;
  };
}

/**
 * Traverse and process nodes in a JSON object
 * @param obj The JSON object to traverse
 * @param processor A function to process each node
 * @returns Processed JSON object
 */
export function traverseJsonNodes<T = any>(
  obj: T, 
  processor: (value: any, key?: string, parent?: any) => any
): T;

/**
 * Vite plugin for processing markdown in JSON files
 * @param options Plugin configuration options
 * @returns Vite plugin instance
 */
declare function jsonMdPlugin(options?: JsonMdPluginOptions): Plugin;

export { jsonMdPlugin };