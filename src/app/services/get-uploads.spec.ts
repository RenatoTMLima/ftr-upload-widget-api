import { randomUUID } from 'node:crypto'
import { isRight, unwrapEither } from '@/shared/either'
import { makeUpload } from '@/test/factories/make-upload'
import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { getUploads } from './get-uploads'

describe('get uploads', () => {
  it('should be able to get the uploads', async () => {
    const namePattern = randomUUID()

    const uploads = await Promise.all(
      Array(5)
        .fill(0)
        .map(_ => makeUpload({ name: `${namePattern}.webp` }))
    )

    const sut = await getUploads({
      searchQuery: namePattern,
    })

    expect(isRight(sut)).toBe(true)

    const res = unwrapEither(sut)

    expect(res.total).toEqual(5)
    expect(res.uploads).toEqual([
      expect.objectContaining({ id: uploads[4].id }),
      expect.objectContaining({ id: uploads[3].id }),
      expect.objectContaining({ id: uploads[2].id }),
      expect.objectContaining({ id: uploads[1].id }),
      expect.objectContaining({ id: uploads[0].id }),
    ])
  })

  it('should be able to get paginated uploads', async () => {
    const namePattern = randomUUID()

    const uploads = await Promise.all(
      Array(5)
        .fill(0)
        .map(_ => makeUpload({ name: `${namePattern}.webp` }))
    )

    let sut = await getUploads({
      searchQuery: namePattern,
      page: 1,
      pageSize: 3,
    })

    expect(isRight(sut)).toBe(true)

    let res = unwrapEither(sut)

    expect(res.total).toEqual(5)
    expect(res.uploads).toEqual([
      expect.objectContaining({ id: uploads[4].id }),
      expect.objectContaining({ id: uploads[3].id }),
      expect.objectContaining({ id: uploads[2].id }),
    ])

    sut = await getUploads({
      searchQuery: namePattern,
      page: 2,
      pageSize: 3,
    })

    expect(isRight(sut)).toBe(true)

    res = unwrapEither(sut)

    expect(res.total).toEqual(5)
    expect(res.uploads).toEqual([
      expect.objectContaining({ id: uploads[1].id }),
      expect.objectContaining({ id: uploads[0].id }),
    ])
  })

  it('should be able to get sorted uploads', async () => {
    const namePattern = randomUUID()

    const uploads = await Promise.all(
      Array(5)
        .fill(0)
        .map((_, index) =>
          makeUpload({
            name: `${namePattern}.webp`,
            createdAt: dayjs().subtract(index, 'days').toDate(),
          })
        )
    )

    let sut = await getUploads({
      searchQuery: namePattern,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    })

    expect(isRight(sut)).toBe(true)

    const res = unwrapEither(sut)

    expect(res.total).toEqual(5)
    expect(res.uploads).toEqual([
      expect.objectContaining({ id: uploads[0].id }),
      expect.objectContaining({ id: uploads[1].id }),
      expect.objectContaining({ id: uploads[2].id }),
      expect.objectContaining({ id: uploads[3].id }),
      expect.objectContaining({ id: uploads[4].id }),
    ])

    sut = await getUploads({
      searchQuery: namePattern,
      sortBy: 'createdAt',
      sortDirection: 'asc',
    })

    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({ id: uploads[4].id }),
      expect.objectContaining({ id: uploads[3].id }),
      expect.objectContaining({ id: uploads[2].id }),
      expect.objectContaining({ id: uploads[1].id }),
      expect.objectContaining({ id: uploads[0].id }),
    ])
  })
})
