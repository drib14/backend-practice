const express = require("express");
const app = express();
app.use(express.json());

const users = [];
let nextId = 1;

function postUser(req, res) {
  const { name, age } = req.body;
  const newUser = { id: nextId++, name, age };
  users.push(newUser);
  res.status = 201;
  res.data = newUser;
}

function getUsers(req, res) {
  res.status = 200;
  res.data = users;
}

function getUserById(req, res) {
  const id = parseInt(req.params.id);
  const user = users.find((u) => u.id === id);
  if (user) {
    res.status = 200;
    res.data = user;
  } else {
    res.status = 404;
    res.data = { message: "User not found" };
  }
}

function updateUser(req, res) {
  const id = parseInt(req.params.id);
  const user = users.find((u) => u.id === id);
  if (user) {
    const { name, age } = req.body;
    user.name = name || user.name;
    user.age = age || user.age;
    res.status = 200;
    res.data = user;
  } else {
    res.status = 404;
    res.data = { message: "User not found" };
  }
}

function deleteUser(req, res) {
  const id = parseInt(req.params.id);
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users.splice(index, 1);
    res.status = 200;
    res.data = { message: "User deleted" };
  } else {
    res.status = 404;
    res.data = { message: "User not found" };
  }
}

module.exports = {
  postUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};