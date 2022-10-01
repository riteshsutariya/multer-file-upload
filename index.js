const express = require('express')
const app = express()
const PORT = 8000
const path = require('path')
const multer = require('multer')
const { MulterError } = require('multer')
const fs = require('fs')

//serving static files
app.use(express.static('public'))

const allowedMimeType = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
]
//file upload storage configuration
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        if (fs.existsSync('./uploads')) {
        } else {
            fs.mkdirSync('./uploads')
        }
        return cb(null, 'uploads')
    }
    , filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

let upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log(file.mimetype)
        if (!allowedMimeType.includes(file.mimetype)) {
            return cb(new Error('invalid file type'))
        }
        cb(null, true)
    },
    limits: { fileSize: 500000 }
}).single('file_to_upload')

//upload file middleware
function uploadFile(req, res, next) {
    console.log('upload file')
    upload(req, res, (error) => {
        if (error instanceof MulterError) {
            return res.send('Multer Error: ' + error.message)
        } else if (error) {
            console.log('uncaught error')
            return res.send('Uncaught Error: ' + error.message)
        }
        next()
    })
}

app.post('/handleUpload', uploadFile, (req, res) => {
    res.write("file uploaded");
    res.end();
})

app.get('/', (req, res) => {
    var options = {
        root: path.join(__dirname) + '/public'
    };

    var fileName = 'index.html';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log('Sent:', fileName);
        }
    });
})
app.listen(PORT, () => {
    console.log(`listeining on http://localhost:${PORT}`)
})