// backend setup
const express = require("express");
const app = express();

app.use(express.json());

const users = [];
let nextId = 1;

// CREATE
function postUser(req, res) {
  const { name, age } = req.body;

  if (!name || !age) {
    return res.status(400).json({ message: "Name and age are required" });
  }

  const newUser = { id: nextId++, name, age };
  users.push(newUser);

  res.status(201).json(newUser);
}

// READ ALL
function getUsers(req, res) {
  res.status(200).json(users);
}

// READ ONE
function getUserById(req, res) {
  const id = Number(req.params.id);

  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json(user);
}

// UPDATE
function updateUser(req, res) {
  const id = Number(req.params.id);

  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { name, age } = req.body;

  if (name !== undefined) user.name = name;
  if (age !== undefined) user.age = age;

  res.status(200).json(user);
}

// DELETE
function deleteUser(req, res) {
  const id = Number(req.params.id);

  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const deleted = users.splice(index, 1)[0];

  res.status(200).json({
    message: "User deleted",
    user: deleted
  });
}

// ROUTES
app.post("/users", postUser);
app.get("/users", getUsers);
app.get("/users/:id", getUserById);
app.put("/users/:id", updateUser);
app.delete("/users/:id", deleteUser);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});