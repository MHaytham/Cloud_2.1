// backend/app.js

require('dotenv').config();
const express = require('express');
const app = express();

// Lambda-style event handler (no external dependencies)
exports.handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event));

  const { method, path } = event.requestContext.http;

  if (method === "ANY" && path === "/tasks") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello from cloudproj-task-api" }),
    };
  }

  return {
    statusCode: 404,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Not Found" }),
  };
};

// Express route that delegates to your handler
app.get('/tasks', async (req, res) => {
  // You could translate req into a Lambda‐style event if you like.
  // For now we'll ignore the event data and just call it empty:
  const result = await lambdaHandler({});
  res.status(result.statusCode).send(JSON.parse(result.body));
});

// Start the server locally
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Task API listening on http://localhost:${port}`);
});

// Still export the handler for AWS Lambda deployments
exports.handler = async (event, context) => {
  const result = await lambdaHandler(event);
  return result;
};
