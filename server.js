const app = require("./app")
require("./dbConnection").connectToMongoDB()

const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})