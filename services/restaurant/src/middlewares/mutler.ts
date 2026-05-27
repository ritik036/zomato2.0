import multer from "multer";

// if we need to upload file on our local server then we would have used diskStorage, but we need to upload on cloud so we will use memoryStorage

const storage = multer.memoryStorage()

const uploadFile = multer({ storage }).single("file")

export default uploadFile;