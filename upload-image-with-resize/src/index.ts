import express from 'express'
import path from 'path'
import multer from 'multer'
import cors from 'cors'
import sharp, { OutputInfo } from 'sharp'
import fs from 'fs/promises'
import { PrismaClient } from '@prisma/client'
import { v4 as uuid } from 'uuid'

const PORT = process.env.PORT || 8000
const app = express()
const prisma = new PrismaClient()

app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())

const storage = multer.diskStorage({
  destination: path.resolve(__dirname, 'public', 'uploads'),
  filename: function (req, file, callback) {
    callback(null, file.originalname)
  }
})

const upload = multer({
  storage
})

app.post('/image', upload.single('avatar'), async (req, res) => {
  const { login } = req.body
  const sharpStream = sharp(req.file.path)

  const id = uuid()
  const outputDir = path.resolve(__dirname, 'public', 'images', 'photos')

  try {
    await fs.access(outputDir)
  } catch (e) {
    await fs.mkdir(outputDir, {
      recursive: true
    })
  }

  const promises: Promise<OutputInfo>[] = []

  promises.push(
    sharpStream
      .clone()
      .resize({ width: 150, height: 150 })
      .jpeg({ quality: 80 })
      .toFile(
        path.resolve(
          req.file.destination,
          outputDir,
          `${login}-${id}-150x150.jpeg`
        )
      )
  )

  promises.push(
    sharpStream
      .clone()
      .resize({ width: 300, height: 300 })
      .jpeg({ quality: 90 })
      .toFile(
        path.resolve(
          req.file.destination,
          outputDir,
          `${login}-${id}-300x300.jpeg`
        )
      )
  )

  promises.push(
    sharpStream
      .clone()
      .resize({ width: 1024, height: 1024 })
      .jpeg({ quality: 80 })
      .toFile(
        path.resolve(
          req.file.destination,
          outputDir,
          `${login}-${id}-1024x1024.jpeg`
        )
      )
  )

  await Promise.all(promises)
  await fs.unlink(req.file.path)

  const { id: newId } = await prisma.images.create({
    data: {
      url: `/images/photos/${login}-${id}-300x300.jpeg`,
      users: {
        connect: {
          id: 1
        }
      }
    }
  }
  )

  return res.json({ message: 'SUCCESS!', id: newId })
})

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' })
})

app.listen(PORT, () => {
  console.log(`App start on http://localhost:${PORT}`)
})
