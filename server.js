require("dotenv").config()
const app = require("./app")


require("./src/config/db").connectToMongoDB()

const PORT = process.env.PORT


app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})