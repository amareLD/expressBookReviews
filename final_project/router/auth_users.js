const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
};

// Only registered users can log in
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' });
  }

  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ username }, 'fingerprint_customer', {
    expiresIn: '1h',
  });

  req.session.token = token;

  return res.status(200).json({ message: 'Login successful', token });
});

// Add or modify a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;

  const token = req.session.token;
  if (!token) {
    return res
      .status(401)
      .json({ message: 'Unauthorized. Please log in to add a review.' });
  }

  const decoded = jwt.verify(token, 'fingerprint_customer');
  const username = decoded.username;

  if (!review) {
    return res.status(400).json({ message: 'Review content is required.' });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: 'Review added/modified successfully.',
    reviews: books[isbn].reviews,
  });



});
  // Delete a book review
  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params; 
    const username = req.session.username; 
  
    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
  
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: `No review found for user ${username} on book with ISBN ${isbn}.` });
    }
  
    delete books[isbn].reviews[username];
  
    return res.status(200).json({ message: `Review deleted for book with ISBN ${isbn} by user ${username}.` });
  });


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
