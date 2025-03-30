require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns").promises;
const app = express();
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// HINT: Do not forget to use a body parsing middleware to handle the POST requests. Also, you can use the function dns.lookup(host, cb) from the dns core module to verify a submitted URL.

// 2. You can POST a URL to /api/shorturl and get a JSON response with original_url and short_url properties. Here's an example: { original_url : 'https://freeCodeCamp.org', short_url : 1}

let urlDatabase = {};

const isValid = async (url) => {
  try {
    await dns.lookup(url);
    return true;
  } catch (err) {
    return false;
  }
};

app.post("/api/shorturl", (req, res) => {
  const { url } = req.body;

  if (!isValid(url)) {
    return res.status(404).json({
      error: "Invalid URL",
    });
  }

  const short_url = Math.random().toString(36).substr(2, 6);
  urlDatabase[short_url] = url;

  res.status(200).json({
    original_url: url,
    short_url: short_url,
  });
});

app.get("/api/shorturl/:shorturl", (req, res) => {
  const shortUrlKey = req.params.shorturl;

  // Look up the original URL from the database
  const original_url = urlDatabase[shortUrlKey];

  if (!original_url) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  // Redirect to the original URL
  res.redirect(original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
