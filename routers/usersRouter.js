const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  sendNewUserForm,
  createNewUser,
  sendLoginForm,
  login,
  logout,
} = require("../controllers/usersController");

//INDEX
router.get("/", getAllUsers);

//NEW
router.get("/new", sendNewUserForm);

//CREATE
router.post("/signup", createNewUser);

//LOGIN - GET
router.get("/login", sendLoginForm);

//LOGIN - POST
router.post("/login", login);

//LOGOUT
router.get("/logout", logout);

module.exports = router;
