require("dotenv").config()
const app = require("./app")


require("./src/config/db").connectToMongoDB()

const PORT = process.env.PORT || 2025;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
