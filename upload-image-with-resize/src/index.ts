import express from 'express'
import path from 'path'
import multer from 'multer'
import cors from 'cors'
import sharp from 'sharp'
import fs from 'fs'
import bodyParser from 'body-parser'

const PORT = process.env.PORT || 8000
const app = express()

const storage = multer.diskStorage({
  destination: path.resolve(__dirname, 'uploads'),
  filename: function (req, file, callback) {
    callback(null, file.originalname)
  }
})

const upload = multer({
  storage
})

app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json())

app.post('/image', upload.single('avatar'), async (req, res) => {
  const { filename: image } = req.file

  console.log(req.body)

  await sharp(req.file.path)
    .resize({ width: 300, height: 300 })
    .jpeg({ quality: 50 })
    .toFile(path.resolve(req.file.destination, 'resized', image))
  fs.unlinkSync(req.file.path)

  return res.json({ message: 'SUCCESS!' })
})

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' })
})

app.listen(PORT, () => {
  console.log(`App start on http://localhost:${PORT}`)
})
