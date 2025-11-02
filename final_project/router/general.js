const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

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
public_users.get('/', async function (req, res) {
  try {
    return res.status(200).json(books);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books", error: err.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Wrap the local books lookup in a Promise
  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error("Book not found"));
    }
  })
  .then(book => res.status(200).json(book))
  .catch(err => res.status(404).json({ message: err.message }));
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    // simulate async fetch
    const booksByAuthor = await new Promise((resolve) => {
      const result = Object.values(books).filter(book => book.author === author);
      resolve(result);
    });

    if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books", error: err.message });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const book = await new Promise((resolve) => {
      const result = Object.values(books).find(book => book.title === title);
      resolve(result);
    });

    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books", error: err.message });
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
