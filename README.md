# vite-plugin-json-md

[![npm version](https://badge.fury.io/js/vite-plugin-json-md.svg)](https://badge.fury.io/js/vite-plugin-json-md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Vite plugin that processes markdown content in JSON/JSON5 files. Particularly useful for i18n applications where translation files need to store complex HTML markup in JSON format. Instead of writing HTML directly in JSON files, you can use more readable markdown syntax or include external markdown files.

## Features

- Process inline markdown in JSON/JSON5 files
- Include external markdown files
- Convert JSON5/JSONC to standard JSON
- Minification options
- Perfect for i18n translation files containing rich text content
- Support for both inline markdown and external markdown files

## Installation

```bash
# npm
npm install vite-plugin-json-md -D

# yarn
yarn add vite-plugin-json-md -D

# pnpm
pnpm add vite-plugin-json-md -D
```

## Usage

### Basic Configuration

Add the plugin to your `vite.config.js`:

```js
import { defineConfig } from 'vite'
import { jsonMdPlugin } from 'vite-plugin-json-md'

export default defineConfig({
  plugins: [
    jsonMdPlugin({
      sourceDir: 'src/locales',
      inputFiles: ['en/*.json5', 'fr/*.json5'],
      markdownDir: 'src/locales/md',
      outputDir: 'src/locales/out',
      parseMarkdown: true,
      convertToJson: true
    })
  ]
})
```

### Example with i18n

Input translation file (`src/locales/en/messages.json5`):

```json5
{
  "welcome": {
    // Inline markdown
    "title": "md:# Welcome to our platform",
    "description": "md:We offer:\n\n- Feature One\n- Feature Two\n- Feature Three",
    
    // External markdown file
    "privacyPolicy": "md:@legal/privacy-policy.md",
    
    // Regular text (no processing)
    "simpleText": "This is regular text without markdown"
  },
  "pricing": {
    "title": "md:## Flexible Pricing Plans",
    "description": "md:Choose the plan that works best for you:\n\n- Basic: $9/mo\n- Pro: $19/mo\n- Enterprise: Contact us"
  }
}
```

External markdown file (`src/locales/md/legal/privacy-policy.md`):

```markdown
# Privacy Policy

We take your privacy seriously:

1. We collect minimal data
2. Your data is encrypted
3. We never share your information

[Learn more about our terms](/terms)
```

Output file (`src/locales/out/en/messages.json`):

```json
{
  "welcome": {
    "title": "<h1>Welcome to our platform</h1>",
    "description": "<ul><li>Feature One</li><li>Feature Two</li><li>Feature Three</li></ul>",
    "privacyPolicy": "<h1>Privacy Policy</h1><p>We take your privacy seriously:</p><ol><li>We collect minimal data</li><li>Your data is encrypted</li><li>We never share your information</li></ol><p><a href=\"/terms\">Learn more about our terms</a></p>",
    "simpleText": "This is regular text without markdown"
  },
  "pricing": {
    "title": "<h2>Flexible Pricing Plans</h2>",
    "description": "<p>Choose the plan that works best for you:</p><ul><li>Basic: $9/mo</li><li>Pro: $19/mo</li><li>Enterprise: Contact us</li></ul>"
  }
}
```

Using with Vue-i18n:

```js
import { createI18n } from 'vue-i18n'
import en from './locales/out/en/messages.json'

const i18n = createI18n({
  messages: { en }
})

export default i18n
```

Template usage:

```vue
<template>
  <div v-html="$t('welcome.title')" />
  <div v-html="$t('welcome.description')" />
  <div v-html="$t('welcome.privacyPolicy')" />
</template>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sourceDir` | `string` | `""` | Source directory containing JSON/JSON5 files |
| `inputFiles` | `string[]` | - | Glob patterns for input files |
| `markdownDir` | `string` | - | Directory containing external markdown files |
| `outputDir` | `string` | - | Output directory for processed files |
| `parseMarkdown` | `boolean` | `true` | Whether to parse markdown into HTML |
| `convertToJson` | `boolean` | `false` | Convert JSON5/JSONC to standard JSON |
| `minify` | `boolean` | `false` | Minify output files |

## Markdown Processing

- Inline markdown: Use `md:` prefix
- External markdown files: Use `md:@filename.md`
- Regular strings: No processing

## License

MIT License © 2024 [Ruslan Makarov](https://github.com/altrusl)


