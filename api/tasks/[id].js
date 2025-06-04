// Vercel Serverless Function: PATCH/DELETE /api/tasks/:id
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const TASKS_TABLE_NAME = process.env.DDB_TABLE || 'Tasks';
const AWS_REGION = process.env.AWS_REGION || 'eu-north-1';

const dynamoDBClient = new DynamoDBClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
const dynamodb = DynamoDBDocumentClient.from(dynamoDBClient);

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Task ID is required' });
    return;
  }

  if (req.method === 'PATCH') {
    const { completed } = req.body;
    if (typeof completed !== 'boolean') {
      res.status(400).json({ error: 'Invalid completed status' });
      return;
    }
    const params = {
      TableName: TASKS_TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET completed = :completed',
      ExpressionAttributeValues: { ':completed': completed },
      ReturnValues: 'ALL_NEW'
    };
    try {
      const result = await dynamodb.send(new UpdateCommand(params));
      res.status(200).json(result.Attributes);
    } catch (error) {
      res.status(500).json({ error: 'Could not update task' });
    }
    return;
  }

  if (req.method === 'DELETE') {
    const params = {
      TableName: TASKS_TABLE_NAME,
      Key: { id }
    };
    try {
      await dynamodb.send(new DeleteCommand(params));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Could not delete task' });
    }
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
