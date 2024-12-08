const express = require('express');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();
const axios = require('axios');

public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' });
  }

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  users.push({ username, password });

  return res.status(201).json({ message: 'User successfully registered' });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  axios
    .get('http://localhost:5000/books')
    .then((response) => {
      res.status(200).json(response.data);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: 'Error fetching books', error: error.message });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  axios
    .get(`http://localhost:5000/books`)
    .then((response) => {
      const books = response.data;
      if (books[isbn]) {
        res.status(200).json(books[isbn]);
      } else {
        res.status(404).json({ message: 'Book not found' });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Error fetching book details',
        error: error.message,
      });
    });
});

// Get book details based on the author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();

  axios
    .get('http://localhost:5000/books')
    .then((response) => {
      const books = response.data;
      const filteredBooks = Object.values(books).filter(
        (book) => book.author.toLowerCase() === author
      );

      if (filteredBooks.length > 0) {
        res.status(200).json(filteredBooks);
      } else {
        res.status(404).json({ message: 'No books found for this author' });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Error fetching books by author',
        error: error.message,
      });
    });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();

  axios
    .get('http://localhost:5000/books')
    .then((response) => {
      const books = response.data;
      const filteredBooks = Object.values(books).filter(
        (book) => book.title.toLowerCase() === title
      );

      if (filteredBooks.length > 0) {
        res.status(200).json(filteredBooks[0]); 
      } else {
        res.status(404).json({ message: 'No books found with this title' });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Error fetching books by title',
        error: error.message,
      });
    });
});

// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (book) {
    return res.status(200).json({ reviews: book.reviews });
  } else {
    return res.status(404).json({ message: 'Book not found' });
  }
});

module.exports.general = public_users;
