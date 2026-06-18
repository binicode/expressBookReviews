const express = require("express");
const books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");

const public_users = express.Router();

// 1. Register a new user
public_users.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({ username, password });
      return res
        .status(200)
        .send(
          JSON.stringify(
            { message: "User successfully registered. Now you can login" },
            null,
            4
          )
        );
    } else {
      return res
        .status(404)
        .send(
          JSON.stringify({ message: "User already exists!" }, null, 4)
        );
    }
  }
  return res
    .status(404)
    .send(
      JSON.stringify(
        { message: "Unable to register user (missing username or password)." },
        null,
        4
      )
    );
});

// 2. Get the book list available in the shop using Promises/Async-Await
public_users.get("/", async function (req, res) {
  try {
    const fetchBooks = () => new Promise((resolve) => resolve(books));
    const bookList = await fetchBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res
      .status(500)
      .send(JSON.stringify({ message: "Error fetching books" }, null, 4));
  }
});

// 3. Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const fetchBookByISBN = (id) =>
      new Promise((resolve, reject) => {
        if (books[id]) {
          resolve(books[id]);
        } else {
          reject("Book not found with this ISBN");
        }
      });

    const book = await fetchBookByISBN(isbn);
    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    return res.status(404).send(JSON.stringify({ message: error }, null, 4));
  }
});

// 4. Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author;
  try {
    const fetchBooksByAuthor = (authorName) =>
      new Promise((resolve, reject) => {
        let matchingBooks = {};
        Object.keys(books).forEach((key) => {
          if (books[key].author.toLowerCase() === authorName.toLowerCase()) {
            matchingBooks[key] = books[key];
          }
        });
        if (Object.keys(matchingBooks).length > 0) {
          resolve(matchingBooks);
        } else {
          reject("No books found by this author");
        }
      });

    const matchedResults = await fetchBooksByAuthor(author);
    return res.status(200).send(JSON.stringify(matchedResults, null, 4));
  } catch (error) {
    return res.status(404).send(JSON.stringify({ message: error }, null, 4));
  }
});

// 5. Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  const title = req.params.title;
  try {
    const fetchBooksByTitle = (titleName) =>
      new Promise((resolve, reject) => {
        let matchingBooks = {};
        Object.keys(books).forEach((key) => {
          if (books[key].title.toLowerCase() === titleName.toLowerCase()) {
            matchingBooks[key] = books[key];
          }
        });
        if (Object.keys(matchingBooks).length > 0) {
          resolve(matchingBooks);
        } else {
          reject("No books found with this title");
        }
      });

    const matchedResults = await fetchBooksByTitle(title);
    return res.status(200).send(JSON.stringify(matchedResults, null, 4));
  } catch (error) {
    return res.status(404).send(JSON.stringify({ message: error }, null, 4));
  }
});

// 6. Get book review
public_users.get("/review/:isbn", async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const fetchReviews = (id) =>
      new Promise((resolve, reject) => {
        if (books[id]) {
          resolve(books[id].reviews);
        } else {
          reject("Reviews not found for this ISBN");
        }
      });

    const reviews = await fetchReviews(isbn);
    return res.status(200).send(JSON.stringify(reviews, null, 4));
  } catch (error) {
    return res.status(404).send(JSON.stringify({ message: error }, null, 4));
  }
});

module.exports.general = public_users;
