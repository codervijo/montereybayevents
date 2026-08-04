// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 'node', not 'jsdom': every test here reads source files or exercises pure
    // data/schema modules, and the scaffold's `environment: 'jsdom'` failed at
    // startup because jsdom was never in devDependencies. A test that genuinely
    // needs a DOM can opt in per file with a `// @vitest-environment jsdom`
    // docblock — that does require adding jsdom to devDependencies first.
    environment: 'node',
    globals: true,
  },
});
