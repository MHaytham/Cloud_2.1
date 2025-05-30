import boto3

# ─── Configuration ──────────────────────────────────────────────────────────────
LAMBDA_NAME     = "Lambda_update"
ZIP_PATH        = r"E:\Project_cloud2.0\backend\Lambda\Lambda_update.zip"
NEW_TABLE_NAME  = "Tasks"
AWS_REGION      = "eu-north-1"   # adjust if your Lambda lives in another region

# ─── Initialize AWS Lambda client ───────────────────────────────────────────────
lambda_client = boto3.client('lambda', region_name=AWS_REGION)

# ─── 1) Update function code ────────────────────────────────────────────────────
with open(ZIP_PATH, 'rb') as f:
    zip_bytes = f.read()

print(f"Updating code for function '{LAMBDA_NAME}' from {ZIP_PATH}...")
code_resp = lambda_client.update_function_code(
    FunctionName=LAMBDA_NAME,
    ZipFile=zip_bytes,
    Publish=True
)
print(" → Code updated, new ARN:", code_resp['FunctionArn'])

# ─── 2) Update environment variable DDB_TABLE ───────────────────────────────────
#    - preserves any existing env vars and just overrides/adds DDB_TABLE
print(f"Setting environment variable DDB_TABLE = '{NSEW_TABLE_NAME}'...")
# fetch existing env vars
config = lambda_client.get_function_configuration(FunctionName=LAMBDA_NAME)
env_vars = config.get('Environment', {}).get('Variables', {})

# update
env_vars['DDB_TABLE'] = NEW_TABLE_NAME

cfg_resp = lambda_client.update_function_configuration(
    FunctionName=LAMBDA_NAME,
    Environment={'Variables': env_vars}
)
print(" → Env update status:", cfg_resp.get('LastUpdateStatus'))

print("✅ Lambda update complete!")
