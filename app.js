// backend/app.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// --- Configuration ──────────────────────────────────────────────────────────────
const TASKS_TABLE_NAME = "Tasks"; // Using the table name from Lambda_function.py
const AWS_REGION = process.env.AWS_REGION || "eu-north-1";

// Configure AWS SDK v3
const dynamoDBClient = new DynamoDBClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const dynamodb = DynamoDBDocumentClient.from(dynamoDBClient);

// Middleware
app.use(cors({
  origin: /http:\/\/localhost:\d+$/,
  credentials: true
}));
app.use(express.json());

// In-memory storage for tasks (replace with database in production)
// let tasks = [];
// let taskId = 1;

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const params = {
      TableName: TASKS_TABLE_NAME
    };
    const result = await dynamodb.send(new ScanCommand(params));
    // Defensive: If Items is undefined, return an empty array
    const items = Array.isArray(result.Items) ? result.Items : [];
    // Sort tasks by creation date to maintain a consistent order
    const sortedTasks = items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json(sortedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Could not retrieve tasks', details: error.message });
  }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTask = {
    id: Date.now().toString(), // Use timestamp as a unique ID
    title,
    description: description || '',
    completed: false,
    createdAt: new Date().toISOString()
  };

  const params = {
    TableName: TASKS_TABLE_NAME,
    Item: newTask
  };

  try {
    await dynamodb.send(new PutCommand(params));
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Could not create task' });
  }
});

// Update a task (toggle completed status)
app.patch('/api/tasks/:id', async (req, res) => {
  const taskId = req.params.id;
  const { completed } = req.body;

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Invalid completed status' });
  }

  const params = {
    TableName: TASKS_TABLE_NAME,
    Key: {
      id: taskId
    },
    UpdateExpression: 'SET completed = :completed',
    ExpressionAttributeValues: {
      ':completed': completed
    },
    ReturnValues: 'ALL_NEW'
  };

  try {
    const result = await dynamodb.send(new UpdateCommand(params));
    res.status(200).json(result.Attributes);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Could not update task' });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  const taskId = req.params.id;

  const params = {
    TableName: TASKS_TABLE_NAME,
    Key: {
      id: taskId
    }
  };

  try {
    await dynamodb.send(new DeleteCommand(params));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Could not delete task' });
  }
});

// Lambda handler
exports.handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event));

  const { method, path } = event.requestContext.http;

  if (method === "GET" && path === "/tasks") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tasks),
    };
  }

  if (method === "POST" && path === "/tasks") {
    const body = JSON.parse(event.body);
    const { title } = body;

    if (!title) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: 'Title is required' }),
      };
    }

    const newTask = {
      id: taskId++,
      title,
      completed: false,
      createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    };
  }

  if (method === "DELETE" && path.startsWith("/tasks/")) {
    const taskId = parseInt(path.split('/').pop());
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: 'Task not found' }),
      };
    }

    tasks.splice(taskIndex, 1);
    return {
      statusCode: 204,
      headers: { "Content-Type": "application/json" },
      body: '',
    };
  }

  return {
    statusCode: 404,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Not Found" }),
  };
};

// Start the server locally
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Task API listening on http://localhost:${port}`);
});
