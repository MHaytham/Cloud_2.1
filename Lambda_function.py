import os
import json
import boto3
from dotenv import load_dotenv

# 1) Load .env from the repo's backend folder
base_dir = os.path.dirname(os.path.dirname(__file__))   # backend/Lambda → backend
dotenv_path = os.path.join(base_dir, '.env')
load_dotenv(dotenv_path)

# 2) Read and validate the table name
table_name = os.getenv('DDB_TABLE')
if not table_name:
    raise RuntimeError("Missing DDB_TABLE environment variable (did you set it in .env?)")

# 3) Initialize DynamoDB client
ddb = boto3.resource('dynamodb')
table = ddb.Table(table_name)

def lambda_handler(event, context):
    try:
        response = table.scan()
        items = response.get('Items', [])

        return {
            'statusCode': 200,
            'headers': { 'Content-Type': 'application/json' },
            'body': json.dumps(items)
        }

    except Exception as e:
        print(f"Error scanning table: {e}")
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json' },
            'body': json.dumps({ 'error': 'Could not fetch tasks' })
        }
