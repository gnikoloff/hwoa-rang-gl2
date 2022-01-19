import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    sourcemap: true,
    format: ['esm', 'cjs'],
    dts: options.dts,
    clean: options.clean,
    minify: options.minify,
    tsconfig: './tsconfig.json',
  }
})
