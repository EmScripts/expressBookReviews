const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username exists
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Check if username/password combo is correct
const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username);
  return user && user.password === password;
};

// 🔐 LOGIN route
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate token
  const accessToken = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });

  // Save session info so future authenticated routes can use it
  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({
    message: "Login successful",
    accessToken
  });
});

// ✍️ Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  console.log("Logged-in user:", username);

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or update review for this user
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review successfully added/modified",
    reviews: books[isbn].reviews
  });
});

// delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Delete review for this user
  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review successfully deleted",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
