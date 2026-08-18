import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const projectRoot = decodeURIComponent(new URL('.', import.meta.url).pathname)

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: isSsrBuild
    ? undefined
    : {
        rollupOptions: {
          input: {
            main: `${projectRoot}index.html`,
            en: `${projectRoot}en/index.html`,
            ka: `${projectRoot}ka/index.html`,
          },
        },
      },
}))
