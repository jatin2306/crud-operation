const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 4000;
const SECRET = 'my_secret_key'; 
app.use(cors());
app.use(express.json());

let tasks = [];
let nextId = 1;

// In-memory user storage
let users = [];
let nextUserId = 1;

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// SIGNUP
app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Username already exists' });
  }
  const newUser = { id: nextUserId++, username, password }; // Store password as plain text for demo only
  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully' });
});

// LOGIN
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// CREATE (protected)
app.post('/api/tasks', authenticateToken, (req, res) => {
  const { name, age, qualification, designation } = req.body;
  if (!name || !age || !qualification || !designation) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const newTask = { id: nextId++, name, age, qualification, designation };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// GET ALL (protected)
app.get('/api/tasks', authenticateToken, (req, res) => {
  res.json(tasks);
});

// UPDATE (protected)
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Record not found' });
  const { name, age, qualification, designation } = req.body;
  if (name !== undefined) task.name = name;
  if (age !== undefined) task.age = age;
  if (qualification !== undefined) task.qualification = qualification;
  if (designation !== undefined) task.designation = designation;
  res.json(task);
});

// DELETE (protected)
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const idx = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Record not found' });
  const deleted = tasks.splice(idx, 1);
  res.json(deleted[0]);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});