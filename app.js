const express = require("express")
const dotenv = require("dotenv")
const ProductRoute = require("./routes/productRoute")
const AuthRoute = require("./routes/authRoute")


dotenv.config()
const app = express()

app.use(express.json())


// Routes definition
app.use('/auth', AuthRoute)
app.use('/product', ProductRoute)



app.get('/', (req, res) =>{
    res.status(200).json({
        message: "Welcome to BeRoStock API"
    })
})

app.get('*', (req,res) =>{
    res.status(404).json({
        message: "Route not found"
    })
})

module.exports = app