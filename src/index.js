const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const users = [];

function checkExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if (!user) return response.status(404).json({ error: 'User not found.' });

  request.user = user;
  next();
}

function checkExistsTodo(request, response, next) {
  try {
    
    const { user } = request;
    const { id } = request.params;
    const todo = user.todos.find((todo) => todo.id === id);
  
    if (!todo) return response.status(404).json({ error: "Todo not found!" });
  
    request.todo = todo;
    next();
  } catch (error) {
    response.status(500).json({ error: error.message() });
  }
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = users.find(user => user.username === username);

  if (user) return response.status(400).json({ error: 'User already exists' });

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);
  
  return response
    .status(201)
    .json(newUser);
});

app.get('/todos', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put(
  '/todos/:id',
  checkExistsUserAccount,
  checkExistsTodo,
  (request, response) => {
    const { user, todo } = request;
    const { title, deadline } = request.body;

    todo.title = title;
    todo.deadline = deadline;

    return response.json(todo);
});

app.patch(
  '/todos/:id/done',
  checkExistsUserAccount,
  checkExistsTodo, 
  (request, response) => {
    const { todo } = request;
    todo.done = true;
    return response.json(todo);
});

app.delete(
  '/todos/:id',
  checkExistsUserAccount,
  checkExistsTodo,
  (request, response) => {
    const { user, todo } = request;
    user.todos.splice(todo, 1);
    return response.status(204).send();
  }
);

module.exports = app;