import multer from "multer";

// configuring storage engine
const storage = multer.diskStorage({

    // specifies destiantion of the files 
    // files shpuld be in ./public/temp directory
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    // specifies the name of the file
    // name of the file shpuld be same sa that of the original uploaded file
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
  
// creating instance of the multer
// this instance will handle file uploades
// congifure insatnce using storage
export const upload = multer({ 
    storage : storage, 
})