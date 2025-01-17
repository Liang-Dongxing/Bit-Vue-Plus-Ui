import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx';
import createUnoCss from './unocss'
import createAutoImport from './auto-import'
import createComponents from './components'
import createIcons from './icons'
import createSvgIconsPlugin from './svg-icon'
import createCompression from './compression'
import createVueSetupExtend from './vue-setup-extend'
import createHtmlPlugin from './create-html-plugin'
import path from 'path'

export default (viteEnv: any, isBuild = false): [] => {
  const vitePlusgins: any = []
  vitePlusgins.push(vue())
  vitePlusgins.push(vueJsx())
  vitePlusgins.push(createUnoCss())
  vitePlusgins.push(createAutoImport(path))
  vitePlusgins.push(createComponents(path))
  vitePlusgins.push(createCompression(viteEnv))
  vitePlusgins.push(createIcons())
  vitePlusgins.push(createSvgIconsPlugin(path, isBuild))
  vitePlusgins.push(createVueSetupExtend())
  vitePlusgins.push(createHtmlPlugin(viteEnv))
  return vitePlusgins
}
