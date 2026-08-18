import { renderToStaticMarkup } from 'react-dom/server'
import App from './App'
import type { Language } from './data'

export function render(language: Language) {
  return renderToStaticMarkup(<App initialLanguage={language} />)
}
