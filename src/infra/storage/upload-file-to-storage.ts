import { randomUUID } from 'node:crypto'
import { basename, extname } from 'node:path'
import { Readable } from 'node:stream'
import { env } from '@/env'
import { Upload } from '@aws-sdk/lib-storage'
import { z } from 'zod'
import { r2 } from './client'

const uploadFileToStorageInput = z.object({
  folder: z.enum(['images', 'downloads']),
  filename: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable),
})

type UploadFileToStorageInput = z.input<typeof uploadFileToStorageInput>

export async function uploadFileToStorage(input: UploadFileToStorageInput) {
  const { contentStream, contentType, filename, folder } =
    uploadFileToStorageInput.parse(input)

  const fileExtension = extname(filename)
  const fileBasename = basename(filename)

  const sanitizedFileBasename = fileBasename.replace(/[^a-zA-Z0-9]/g, '')

  const uniqueFilename = `${folder}/${randomUUID()}-${sanitizedFileBasename.concat(fileExtension)}`

  const upload = new Upload({
    client: r2,
    params: {
      Key: uniqueFilename,
      Bucket: env.CLOUDFLARE_BUCKET,
      Body: contentStream,
      ContentType: contentType,
    },
  })

  await upload.done()

  return {
    key: uniqueFilename,
    url: new URL(uniqueFilename, env.CLOUDFLARE_PUBLIC_URL).toString(),
  }
}
