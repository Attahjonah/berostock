const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("./src/config/passport");
const MongoStore = require("connect-mongo");

// Routes
const authRouter = require("./src/routes/authRoute");
const productRouter = require("./src/routes/productRoute");
const salesRouter = require("./src/routes/saleRoute");
const reportRouter = require("./src/routes/reportRoute");
const invoiceRouter = require("./src/routes/invoiceRoute");
const clientRouter = require("./src/routes/clientRoute");

const { API_VERSION, SESSION_SECRET } = process.env;
const app = express();

// Swagger
const { swaggerServe, swaggerSetup, specs } = require("./src/config/swagger");


// LOGGING & BASIC SECURITY
app.use(morgan("dev"));
app.use(cors({
  origin: ["http://localhost:3000", "https://berostock.netlify.app"],
  credentials: true
}));
app.use(helmet());
app.use(cookieParser());


// SESSION CONFIG
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());


app.use("/api/report", reportRouter);
app.use("/invoice", invoiceRouter);


// JSON Body Parsing 
app.use(express.json());

// Default Welcome Route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to BeRoStock API",
  });
});


// Main Routes
app.use(`/api/v${API_VERSION}/auth`, authRouter);
app.use("/api/products", productRouter);
app.use("/api/sales", salesRouter);
app.use("/api/clients", clientRouter);


// Swagger Docs
app.use("/api-docs", swaggerServe, swaggerSetup(specs));


// 404 Handler
app.get("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

module.exports = app;
