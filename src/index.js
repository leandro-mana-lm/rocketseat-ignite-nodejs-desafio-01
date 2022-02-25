const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3333;
const users = [];

function checkUser(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) return response.status(404).json({ error: 'User not found!' });

  request.user = user;

  return next();
}

function checkUserToDo(request, response, next) {
  const { id } = request.params;
  const filterID = (toDo) => toDo.id === id;
  const user = users.find((user) => user.toDoList.find(filterID));

  if (!user)
    return response.status(404).json({ error: "User's To Do not found!" });

  const index = user.toDoList.findIndex(filterID);

  request.user = user;
  request.index = index;

  return next();
}

app.use(express.json());

app.get('/users', (request, response) => {
  return response.json(users);
});

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userExists = users.some((user) => user.username === username);

  if (userExists)
    return response.status(400).json({ error: 'The user already exists!' });

  const user = { id: uuidv4(), name, username, toDoList: [] };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/to-do', checkUser, (request, response) => {
  const { user } = request;

  return response.json(user.toDoList);
});

app.post('/to-do', checkUser, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const toDo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    createdAt: new Date(),
  };

  user.toDoList.push(toDo);

  return response.status(201).json(toDo);
});

app.put('/to-do/:id', checkUserToDo, (request, response) => {
  const { title, deadline } = request.body;
  const { user, index } = request;

  user.toDoList[index].title = title;
  user.toDoList[index].deadline = new Date(deadline);

  return response.status(201).json(user.toDoList[index]);
});

app.patch('/to-do/:id/done', checkUserToDo, (request, response) => {
  const { user, index } = request;

  user.toDoList[index].done = true;

  return response.status(201).json(user.toDoList[index]);
});

app.delete('/to-do/:id', checkUserToDo, (request, response) => {
  const { user, index } = request;

  user.toDoList.splice(index, 1);

  return response.status(204).send();
});

app.listen(port, () => console.log(`Listening on Port ${port}...`));
