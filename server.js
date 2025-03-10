require("dotenv").config()
const app = require("./app")
//const cloudinary = require("cloudinary").v2
const path = require("path")


require("./dbConnection").connectToMongoDB()

const PORT = process.env.PORT

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// })

// (async function() {
//     const filePath = path.join(__dirname, "./images/Slush Machine.jpg")
//     const results = await cloudinary.uploader.upload(filePath)
//     console.log(results)
// })()


app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})