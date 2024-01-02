import { config } from 'bundled-eslint-config'


export default config({
  ts: {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
})
