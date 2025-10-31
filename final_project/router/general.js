const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // 1️⃣ Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // 2️⃣ Check if username already exists
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // 3️⃣ Add the new user
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // get list of books
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //pass isbn as parameter
  let isbn = req.params.isbn;
  let book = books[isbn];
  if (book) {
      return res.status(200).json(book);
  } else {
      return res.status(404).json({message: "Book not found"});
  }
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //get all keys from books object
  let author = req.params.author;
  let booksByAuthor = Object.values(books).filter(book => book.author === author);
  if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor);
  } else {
      return res.status(404).json({message: "Book not found"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //pass title as parameter
  let title = req.params.title;
  let book = Object.values(books).find(book => book.title === title);
  if (book) {
      return res.status(200).json(book);
  } else {
      return res.status(404).json({message: "Book not found"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //pass isbn as parameter
  let isbn = req.params.isbn;
  let book = books[isbn];
  if (book) {
    // return the reviews object
      return res.status(200).json(book.reviews);
  } else {
      return res.status(404).json({message: "Reviews not found"});
  }
});

module.exports.general = public_users;
