const dotenv = require("dotenv");
dotenv.config();
const express = require("express") 
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser")
const session = require("express-session")
const passport = require("./src/config/passport");

const MongoStore = require("connect-mongo");
const authRouter = require("./src/routes/authRoute");
const productRouter = require("./src/routes/productRoute");
const salesRouter = require("./src/routes/saleRoute");
const adminRouter = require("./src/routes/adminRoute")
const invoiceRouter = require("./src/routes/invoiceRoute");

const { API_VERSION, SESSION_SECRET } = process.env;
const app = express();



const {  swaggerServe, swaggerSetup, specs  } = require("./src/config/swagger");

app.use(morgan("dev"));
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      collectionName: 'sessions',
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
); 

app.use(passport.initialize());
app.use(passport.session());


app.get("/", (req, res) => {
    res.status(200).json({
      message: "Welcome to BeRoStock API",
    });
  });

  
// Routes definition
app.use(`/api/v${API_VERSION}/auth/`, authRouter);
app.use("/api-docs", swaggerServe, swaggerSetup(specs));
app.use("/api/products", productRouter);
app.use("/api/sales", salesRouter);
app.use("/api/admin", adminRouter);
app.use('/invoice', invoiceRouter);



app.get("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});


module.exports = app;
