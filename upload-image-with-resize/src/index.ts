import express from 'express'
import path from 'path'
import multer from 'multer'
import cors from 'cors'
import sharp from 'sharp'
import fs from 'fs/promises'
// import { PrismaClient } from '@prisma/client'
import { v4 as uuid } from 'uuid'

const PORT = process.env.PORT || 8000
const app = express()
// const prisma = new PrismaClient()

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
  const thumbnail = sharp(req.file.path)
  const medium = thumbnail.clone()
  const id = uuid()
  const outputDir = path.resolve(__dirname, 'public', 'images', 'avatars')

  try {
    await fs.access(outputDir)
  } catch (e) {
    await fs.mkdir(outputDir, {
      recursive: true
    })
  }

  await thumbnail
    .resize({ width: 300, height: 300 })
    .jpeg({ quality: 75 })
    .toFile(path.resolve(req.file.destination, outputDir, `${login}-${id}-300.jpeg`))

  await medium
    .resize({ width: 600, height: 600 })
    .jpeg({ quality: 80 })
    .toFile(path.resolve(req.file.destination, outputDir, `${login}-${id}-600.jpeg`))

  await fs.unlink(req.file.path)

  return res.json({ message: 'SUCCESS!' })
})

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' })
})

app.listen(PORT, () => {
  console.log(`App start on http://localhost:${PORT}`)
})
