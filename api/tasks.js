// Vercel Serverless Function: GET /api/tasks
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

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
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  try {
    const params = { TableName: TASKS_TABLE_NAME };
    const result = await dynamodb.send(new ScanCommand(params));
    const items = Array.isArray(result.Items) ? result.Items : [];
    const sortedTasks = items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.status(200).json(sortedTasks);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve tasks', details: error.message });
  }
}
