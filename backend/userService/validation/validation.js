// validation/userValidation.js
import { check, validationResult } from "express-validator";

// Basic validation for login
export const validateUserLogin = [
  check("userName").isEmail().withMessage("Please enter a valid email"),
  check("password")
    .if((value, { req }) => req.body.loginType !== "googleAuth") // Skip password check for Google OAuth
    .notEmpty()
    .withMessage("Password is required")
    .trim()
    .escape(),
  check("role")
    .isIn(["Admin", "Buyer", "Merchant"])
    .withMessage("Invalid role"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Basic validation for signup
export const validateUserSignUp = [
  check("userName")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(), // Sanitize email input
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .trim()
    .escape(), // Sanitize password input
  check("contact")
    .isNumeric()
    .withMessage("Contact must be numeric")
    .isLength({ min: 10, max: 10 })
    .withMessage("Contact must be exactly 10 digits")
    .trim(), // Sanitize contact input
  check("address")
    .isLength({ min: 10 })
    .withMessage("Address must be at least 10 characters long")
    .matches(/\d/)
    .withMessage("Address must contain a number")
    .matches(/[a-zA-Z]/)
    .withMessage("Address must contain letters")
    .trim()
    .escape(), // Sanitize address input
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
