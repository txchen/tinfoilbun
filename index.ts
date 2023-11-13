import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/bun'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

interface FileEntry {
  url: string;
  size: number;
}

const walk = async (dirPath: string): Promise<FileEntry[]> => {
  const entries = await readdir(dirPath, { withFileTypes: true })
  const paths = await Promise.all(
    entries.map((entry) => {
      const childPath = join(dirPath, entry.name)
      if (entry.isDirectory()) {
        return walk(childPath)
      } else {
        return [{ url: childPath, size: Bun.file(childPath).size }]
      }
    }),
  )
  return paths.flat().filter(e => ['nsz', 'nsp', 'xci'].includes(e.url.split(".").pop()?.toLowerCase() || ''))
}

const tflContent: { files: FileEntry[]; success: string, directories: string[] } = {
  success: 'tinfoilbun: content not scanned',
  files: [],
  directories: [],
}
const nspLocation = './static'

const scanContent = async () => {
  const fileEntries = await walk(nspLocation)
  console.log(`Found ${fileEntries.length} files in ${nspLocation}`)
  tflContent.success = `tinfoilbun: content scanned - ${fileEntries.length}`
  tflContent.files = fileEntries
  console.log('tflContent', tflContent)
  return tflContent
}

await scanContent()


const app = new Hono()

app.use(
  '/*',
  basicAuth({
    username: 'u',
    password: 'p',
  }),
)

app.use('*', logger())

// return a tfl file from the root, spec: https://blawar.github.io/tinfoil/custom_index/
// client will detect this then parse the tfl file and extract content from it
app.get('/', (c) => c.json(tflContent))
app.post('/scan', async (c) => c.json(await scanContent()))

// serve static file from ./static folder, cannot figure out how to serve dir outside of project dir
// need to mount the files into 'static' here
app.use('/static/*', serveStatic({ root: './' }))

export default app
