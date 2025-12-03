import swc from 'unplugin-swc'
import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    root: './',
    alias: {
      '@src': './src',
      '@test': './test',
    },
  },
  resolve: {
    alias: {
      '@src': './src',
      '@test': './test',
    },
  },

  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})
