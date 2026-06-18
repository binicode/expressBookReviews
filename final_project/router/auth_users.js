const express = require("express");
const { sign } = require("jsonwebtoken");
const books = require("./booksdb.js");

const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Returns true if the username is unique (does not already exist in the records)
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length === 0;
};

const authenticatedUser = (username, password) => {
  // Returns true if username and password match a registered user record
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
};

// only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Error logging in: Missing username or password" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JSON Web Token using secret key "access"
    let accessToken = sign({ data: password }, "access", { expiresIn: 60 * 60 });

    // Store the token inside the express-session instance
    req.session.authorization = {
      accessToken,
      username,
    };

    return res.status(200).send(`User ${username} successfully logged in`);
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login Credentials. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review; // Review sent as a query parameter
  const username = req.session.authorization
    ? req.session.authorization["username"]
    : null;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found with this ISBN" });
  }

  if (!reviewText) {
    return res.status(400).json({ message: "Review content cannot be empty" });
  }

  if (!username) {
    return res
      .status(403)
      .json({ message: "User not authenticated or session expired" });
  }

  books[isbn].reviews[username] = reviewText;

  return res.status(200).json({
    message: `The review for book with ISBN ${isbn} has been added/updated successfully.`,
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found with this ISBN" });
  }
  if (!username) {
    return res
      .status(403)
      .json({ message: "User not authenticated or session expired" });
  }

  delete books[isbn].reviews[username];
  return res
    .status(200)
    .json({ message: `Review for ISBN ${isbn} deleted successfully.` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
