import os
import time
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table(os.getenv("DYNAMO_TABLE"))

def save_message(user_id, message, role, chat_id="default"):
    # Limit to 50 messages per user per chat
    history = get_recent_messages(user_id, chat_id)
    if len(history) >= 50:
        # Delete the oldest message
        oldest = min(history, key=lambda x: int(x["timestamp"]))
        table.delete_item(Key={"user_id": user_id, "timestamp": oldest["timestamp"]})
    table.put_item(Item={
        "user_id": user_id,
        "timestamp": str(int(time.time())),  # store as string for DynamoDB
        "role": role,
        "message": message,
        "chat_id": chat_id
    })

def get_recent_messages(user_id, chat_id):
    response = table.query(
        KeyConditionExpression=Key("user_id").eq(user_id),
        Limit=10,
        ScanIndexForward=False
    )
    items = sorted(response.get("Items", []), key=lambda x: x["timestamp"])
    return [i for i in items if i["chat_id"] == chat_id]
