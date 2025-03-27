import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },


  js.configs.recommended, //ESLint 官方提供的推荐规则集 这是一套通用规则，不能影响到后面更具体的 Vue 规则，应该先加载
  ...pluginVue.configs['flat/essential'], // 是 Vue 官方提供的规则集
  skipFormatting, // 关闭 ESLint 中与 Prettier 重叠的格式化规则

  {
    rules: {
      'vue/multi-word-component-names': 'off', // 不在强制要求组件命名
    },
  },
]
