const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const expressHandlebars = require("express-handlebars"); //<--import express-hbs
const hbs = expressHandlebars.create({
  defaultLayout: null,
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});
// const cors = require("cors");

const { DATABASE_URL, PORT, JWT_KEY_SECRET } = require("./config");
//insert Routers here *******
const storiesRouter = require("./routers/storiesRouter");
const usersRouter = require("./routers/usersRouter");

const app = express(); //<-------instantiate express app 🌱
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars"); //<----using the handlebars eng. 🚲

//-----Middleware-------⬇️
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ limit: "200mb", extended: false }));
app.use(methodOverride("_method"));
app.use(cookieParser());
// app.use(cors())

//rolled out our own cors middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Origin, X-Requested-With, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

/** 
const allowedOrigins = ['https://example.com', 'https://another-example.com'];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Content-Length, Origin, X-Requested-With, Accept, Authorization'
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
*/

//STORY ROUTES USE TO BE HERE

app.use("/stories", storiesRouter);

//------------------------------------------
//USER ROUTES USE TO BE HERE

app.use("/users", usersRouter);

//------------------------------------------

const db = mongoose.connection;

db.on("connecting", () => {
  console.log("Connecting to MongoDB...");
});

db.on("connected", () => {
  console.log("Connected to MongoDB.");
});

db.on("error", (error) => {
  console.error("Error connecting to MongoDB:", error);
});

db.on("disconnected", () => {
  console.log("Disconnected from MongoDB.");
});

db.on("open", () => {
  console.log("Connection to MongoDB is open.");
});

const startServer = async () => {
  try {
    //Hey mongoose 🦦, please establish a connection to our Atlas database before we turn on our app.
    await mongoose.connect(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    //...ok now that we are connected to the DB, let's turn on the server app 💡
    app.listen(PORT, () => {
      console.log(`Your app is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

startServer();
