const express = require("express");
var path=require('path');
var fs = require("fs");
require("./connect");
const app = express();
app.use(express.static(path.join(__dirname, "./Homepage")));
express.static(path.join(__dirname, "./Homepage"));
const body1 = require("body-parser");
const user1 = require("./connect");
const encoded = body1.urlencoded({ extended: false });
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/singup.html");
});

app.post("/signup", encoded, async (req, res) => {
  try {
    let user = await user1(req.body);
    await user.save();
    res.sendFile(path.resolve(__dirname, 'userconfirmation.html'));
  } catch (err) {
    console.log(err);
    res.status(500).send('Error occurred while saving user data.');
  }
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});
app.post("/loggedin", encoded, async (req, res) => {
  const username1 = req.body.username;
  const password1 = req.body.password;
  user1
    .findOne({ email: username1, password: password1 })
    .then((user) => {
      if (user) {
        fs.readFile("./Homepage/index.html", (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end("Error loading index.html");
          } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
          }
        });
      } 
        else {
          res.sendFile(path.resolve(__dirname, 'errormsg.html'));
        }
      
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});
app.get("/dashboard", (req, res) => {
  res.send("Welcome User");
});
app.listen(8080, () => {
  console.log("Server is rumming on port 8080");
});

