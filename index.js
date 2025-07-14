const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

let tasks = [];
let nextId = 1;

// CREATE
app.post('/api/tasks', (req, res) => {
  const { name, age, qualification, designation } = req.body;
  if (!name || !age || !qualification || !designation) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const newTask = { id: nextId++, name, age, qualification, designation };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

//GET ALL
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});


// UPDATE
app.put('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Record not found' });
  const { name, age, qualification, designation } = req.body;
  if (name !== undefined) task.name = name;
  if (age !== undefined) task.age = age;
  if (qualification !== undefined) task.qualification = qualification;
  if (designation !== undefined) task.designation = designation;
  res.json(task);
});

// DELETE
app.delete('/api/tasks/:id', (req, res) => {
  const idx = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Record not found' });
  const deleted = tasks.splice(idx, 1);
  res.json(deleted[0]);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 