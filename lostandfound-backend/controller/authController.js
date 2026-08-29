const bcrypt = require("bcryptjs"); // bcrypt: For hashing passwords
const jwt = require("jsonwebtoken"); // jsonwebtoken: for signing/verifying tokens
const User = require("../models/user"); // the Mongoose model backing the users collection

const register = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // Always validate input before using it — calling .toLowerCase() on an
    // undefined email would throw and skip straight to the catch block below.
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check password strength HERE, on the plain text, while we still can —
    // after bcrypt.hash() every password becomes a 60-character hash, so the
    // schema can no longer tell a short password from a long one.
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Normalize the email so "Test@Mail.com" and "test@mail.com" are treated
    // as the same account. Do this once validation has confirmed email exists.
    const emailInLowerCase = email.toLowerCase();

    // Ask the database for a user with this email so we don't allow duplicate
    // accounts. findOne() returns the matching document, or null if there is none.
    const existingUser = await User.findOne({ email: emailInLowerCase });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

   
    const newUser = await User.create({
      email: emailInLowerCase,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, email: newUser.email },
    });
  } catch (e) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const emailInLowerCase = email.toLowerCase();

   
    const existingUser = await User.findOne({ email: emailInLowerCase });
    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }


    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }


    const token = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (e) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const authController = { register, login };

module.exports = authController;
