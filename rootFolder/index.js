const express = require('express')
const app = express()
app.set('view engine', 'ejs');
const path = require('path')
const  bodyParser = require("body-parser");
const crypto = require('crypto')
const mongoose = require('mongoose')
const multer = require('multer')
const {GridFsStorage} = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
const methodOverride = require('method-override')

app.use(bodyParser.json())
app.use(methodOverride('_method'))
const mongoUri = 'mongodb://127.0.0.1:27017/mydb2'

const conn = mongoose.createConnection(mongoUri)
let gfs;
conn.once('open', () => {
    gfs =  Grid(conn.db, mongoose.mongo)
    gfs.collection('uploads')
})

const storage = new GridFsStorage({
    url: mongoUri, 
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads' 
          };
          resolve(fileInfo);
        });
      });
    }  
  });
  const upload = multer({ storage });



app.post('/upload', upload.single('file'), (req,res) =>{
    res.json({file:req.file})
})

app.get('/' , (req, res) =>{
    res.render('app')

})

const port = 5000;  
app.listen(port, (req, res) =>{
    console.log(`server is running on port ${port}`)
})
