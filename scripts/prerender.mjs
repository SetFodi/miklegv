import { readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const projectRoot = resolve(import.meta.dirname, '..')
const serverEntry = pathToFileURL(resolve(projectRoot, '.seo-ssr/entry-server.js')).href
const { render } = await import(serverEntry)

const pages = [
  { file: 'index.html', language: 'en' },
  { file: 'en/index.html', language: 'en' },
  { file: 'ka/index.html', language: 'ka' },
]

for (const page of pages) {
  const outputPath = resolve(projectRoot, 'dist', page.file)
  const html = await readFile(outputPath, 'utf8')
  const renderedApp = render(page.language)

  if (!html.includes('<div id="root"></div>')) {
    throw new Error(`Could not find the root placeholder in ${page.file}`)
  }

  await writeFile(
    outputPath,
    html.replace('<div id="root"></div>', `<div id="root">${renderedApp}</div>`),
    'utf8',
  )
}

await rm(resolve(projectRoot, '.seo-ssr'), { recursive: true, force: true })
