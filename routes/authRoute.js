const express = require("express");

const { signup, login } = require("../services/authService");

const {
  signupValidator,
  loginValidator,
} = require("../utils/validators/authValidator");

const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post('/login', loginValidator, login);


module.exports = router;
