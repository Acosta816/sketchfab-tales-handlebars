//authentication
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { JWT_KEY_SECRET } = require("../config");
const { User } = require("../models/user"); //imoirting USER model:

//--------

//INDEX
const getAllUsers = async (req, res, next) => {
  //   let isLoggedIn = false;
  let isLoggedIn = !!req.cookies.access_token;
  let linkText = isLoggedIn ? "Logout" : "Login/Sign Up";
  let pathText = isLoggedIn ? "logout" : "login";

  const users = await User.find(); //grabbing all the users

  res.render("users/users", { users, isLoggedIn, linkText, pathText });
};

//NEW
const sendNewUserForm = (req, res, next) => {
  let isLoggedIn = !!req.cookies.access_token;
  let linkText = isLoggedIn ? "Logout" : "Login/Sign Up";
  let pathText = isLoggedIn ? "logout" : "login";
  res.render("users/newuser", { isLoggedIn, linkText, pathText });
};

// CREATE
const createNewUser = async (req, res, next) => {
  console.log("Posting New User");

  const requiredFields = ["firstName", "lastName", "email", "password"];

  for (let field of requiredFields) {
    if (!(field in req.body)) {
      const errorMessage = `Missing ${field} in request body`;
      console.error(errorMessage);
      return res.send(errorMessage);
    }
  }

  // Normalizing email
  req.body.email = req.body.email.toLowerCase();
  console.log(req.body);

  const { firstName, lastName, email, password } = req.body;

  try {
    // Hashing the password with bcrypt
    const encryptedPw = await bcrypt.hash(password, 12); // anything higher than 12 can be slow
    console.log(`Finished encrypting password: ${encryptedPw}`);

    const newUser = { firstName, lastName, email, password: encryptedPw };

    const usr = await User.create(newUser);

    const token = jwt.sign(
      { userId: usr.id, email: usr.email }, // payload
      JWT_KEY_SECRET // server secret
      // { expiresIn: '1hr' }
    );

    // const response = { user: usr, token }
    // return res.send(response)

    return res.cookie("access_token", token).redirect("/users");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
};

//LOGIN - GET
const sendLoginForm = (req, res, next) => {
  let isLoggedIn = !!req.cookies.access_token;
  let linkText = isLoggedIn ? "Logout" : "Login/Sign Up";
  let pathText = isLoggedIn ? "logout" : "login";
  res.render("users/login", { isLoggedIn, linkText, pathText });
};

// LOGIN - POST
const login = async (req, res, next) => {
  try {
    // Normalize email:
    req.body.email.toLowerCase();

    // Let's check if the user exists:
    const usr = await User.findOne({ email: req.body.email });
    console.log(usr);

    if (!usr) {
      return res.send("email not found");
    } // End of email check

    // Now that the user exists, we'll check if the req.body.password matches the user's password:
    const matched = await bcrypt.compare(req.body.password, usr.password); // bcrypt.compare is a method that returns TRUE or FALSE

    if (matched === false) {
      return res.send("invalid password, try again");
    }

    const token = jwt.sign(
      { userId: usr.id, email: usr.email },
      JWT_KEY_SECRET
      //   { expiresIn: '1hr' }
    );

    return res.cookie("access_token", token).redirect("/users");
  } catch (error) {
    // Handle errors, e.g., log them and respond with an error status
    console.error(error);
    res.status(500).send("An error occurred while processing your request.");
  }
};

//LOGOUT
const logout = (req, res, next) => {
  console.log("is my logout working? or not?????? aaaaaah!");
  const token = req.cookies.access_token;
  console.log(token);
  if (!token) {
    return res.send("Failed to logout");
  }
  const data = jwt.verify(token, JWT_KEY_SECRET);
  console.log(data);

  return res.clearCookie("access_token").redirect("/users/login");
};

module.exports = {
  getAllUsers,
  sendNewUserForm,
  createNewUser,
  sendLoginForm,
  login,
  logout,
};
