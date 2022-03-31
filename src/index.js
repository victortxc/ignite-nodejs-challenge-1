const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find((user) => user.username === username);

  if(user) {
    request.user = user;
    return next();
  } else {
    return response.status(404).send({error: "usuário não existe."})
  }
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const id = uuidv4();

  const userExists = users.some((user) => user.username === username);

  if(userExists) {
    return response.status(400).send({error: "Usuário já cadastrado."})
  }

  const user = {
    id: id,
    name: name,
    username: username,
    todos: []
  }

  users.push(user)

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  return response.status(200).send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  const {title, deadline} = request.body;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).send(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const {title, deadline} = request.body;

  const todo = user.todos.find((todo) => todo.id === id);

  if(todo) {
    todo.title = title;
    todo.deadline = new Date(deadline);
  
    return response.status(200).send(todo);
  } else {
    return response.status(404).send({error: "Tarefa não encontrada."})
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(todo){
    todo.done = true;
    return response.status(200).send(todo);
  } else {
    return response.status(404).send({error: "Tarefa não encontrada."})
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todoExists = user.todos.find((todo) => todo.id === id);

  if(todoExists) {
    const newTodolist = user.todos.filter((todo) => todo.id !== id);
    user.todos = newTodolist;
    return response.status(204).send();
  } else {
    return response.status(404).send({error: "Está tarefa não existe."})
  }


});

module.exports = app;