import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/telemetry-overlay.js',
  output: {
    file: 'dist/telemetry-overlay.js',
    format: 'es',
    name: 'StarCompass',
    exports: 'default',
  },
  plugins: [terser()],
}
