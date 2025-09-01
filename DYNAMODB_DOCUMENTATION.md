# CodeKurukshetra DynamoDB Database Design

## Overview

This document outlines the DynamoDB database design for the CodeKurukshetra hackathon registration system. DynamoDB is chosen for its scalability, performance, and seamless AWS integration.

## Design Principles

### Single Table Design
We use DynamoDB's single table design pattern with composite keys and Global Secondary Indexes (GSIs) for optimal performance and cost efficiency.

### Key Design Patterns
- **Composite Primary Keys**: PK (Partition Key) + SK (Sort Key)
- **GSIs for Access Patterns**: Support different query patterns
- **Hierarchical Data**: Store related data together
- **Overloading**: Use same table for different entity types

## Table Structure

### Main Table: `codekurukshetra_main`

#### Partition Key (PK) and Sort Key (SK) Patterns

| Entity Type | PK Pattern | SK Pattern | Description |
|-------------|------------|------------|-------------|
| Participant | `PARTICIPANT#<uuid>` | `PROFILE` | Individual participant data |
| Team | `TEAM#<uuid>` | `PROFILE` | Team metadata |
| Payment | `PAYMENT#<uuid>` | `TRANSACTION` | Payment transaction data |
| Config | `CONFIG` | `HACKATHON` | Event configuration |
| Statistics | `STATS` | `DAILY#<date>` | Daily statistics |

## Entity Schemas

### 1. Participant Entity

```json
{
  "PK": "PARTICIPANT#01234567-89ab-cdef-0123-456789abcdef",
  "SK": "PROFILE",
  "GSI1PK": "EMAIL#john.doe@example.com",
  "GSI2PK": "TEAM#team-uuid",
  "GSI3PK": "COLLEGE#example-university",
  "entity_type": "participant",
  "participant_id": "01234567-89ab-cdef-0123-456789abcdef",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+91-9876543210",
  "college": "Example University",
  "year": "3rd Year",
  "github_username": "johndoe",
  "linkedin": "https://linkedin.com/in/johndoe",
  "student_status": true,
  "registration_type": "team_member",
  "team_id": "team-uuid-here",
  "payment_status": "paid",
  "is_leader": true,
  "firebase_uid": "firebase-user-uid",
  "created_at": "2025-08-27T10:00:00Z",
  "updated_at": "2025-08-27T10:00:00Z",
  "ttl": 1735689600  // Optional: Auto-delete after event
}
```

### 2. Team Entity

```json
{
  "PK": "TEAM#team-uuid-here",
  "SK": "PROFILE", 
  "GSI1PK": "PAYMENT_STATUS#paid",
  "GSI2PK": "TRACK#ai-ml",
  "GSI3PK": "LEADER#participant-uuid",
  "entity_type": "team",
  "team_id": "team-uuid-here",
  "name": "Code Warriors",
  "track": "ai-ml",
  "leader_participant_id": "01234567-89ab-cdef-0123-456789abcdef",
  "payment_status": "paid",
  "payment_order_id": "order_razorpay_id",
  "payment_id": "pay_razorpay_id", 
  "amount": 99900,
  "currency": "INR",
  "member_count": 4,
  "max_members": 4,
  "registration_complete": true,
  "created_at": "2025-08-27T10:00:00Z",
  "updated_at": "2025-08-27T10:00:00Z"
}
```

### 3. Payment Entity

```json
{
  "PK": "PAYMENT#payment-uuid",
  "SK": "TRANSACTION",
  "GSI1PK": "TEAM#team-uuid",
  "GSI2PK": "STATUS#paid",
  "GSI3PK": "DATE#2025-08-27",
  "entity_type": "payment",
  "payment_id": "payment-uuid",
  "razorpay_order_id": "order_razorpay_id",
  "razorpay_payment_id": "pay_razorpay_id",
  "team_id": "team-uuid-here",
  "amount": 99900,
  "currency": "INR", 
  "status": "paid",
  "payment_method": "card",
  "razorpay_signature": "signature_hash",
  "webhook_verified": true,
  "metadata": {
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.1",
    "payment_timestamp": "2025-08-27T10:30:00Z"
  },
  "created_at": "2025-08-27T10:00:00Z",
  "updated_at": "2025-08-27T10:30:00Z"
}
```

### 4. Configuration Entity

```json
{
  "PK": "CONFIG",
  "SK": "HACKATHON",
  "entity_type": "config",
  "event_name": "CodeKurukshetra",
  "registration_open": true,
  "registration_start": "2025-08-01T00:00:00Z",
  "registration_end": "2025-09-15T23:59:59Z",
  "event_start": "2025-09-20T10:00:00Z",
  "event_end": "2025-09-22T18:00:00Z",
  "team_fee": 99900,
  "max_team_size": 4,
  "min_team_size": 2,
  "max_teams": 500,
  "tracks": [
    "ai-ml",
    "web-mobile", 
    "blockchain",
    "iot-hardware",
    "social-impact",
    "open-innovation"
  ],
  "updated_at": "2025-08-27T10:00:00Z"
}
```

## Global Secondary Indexes (GSI)

### GSI1: Email Lookup
- **Purpose**: Quick participant lookup by email
- **PK**: `EMAIL#<email>`
- **SK**: `PARTICIPANT#<uuid>`
- **Projection**: ALL

**Use Cases**:
- Check if email already registered
- User login/profile lookup
- Duplicate email validation

### GSI2: Team Membership
- **Purpose**: Find all members of a team
- **PK**: `TEAM#<team_id>`  
- **SK**: `PARTICIPANT#<uuid>`
- **Projection**: ALL

**Use Cases**:
- List team members
- Team management operations
- Team statistics

### GSI3: Administrative Queries
- **Purpose**: Support various admin queries
- **PK**: Overloaded (payment status, track, college, etc.)
- **SK**: Entity identifier
- **Projection**: ALL

**Examples**:
- `PAYMENT_STATUS#paid` → Find all paid teams
- `TRACK#ai-ml` → Find teams in AI/ML track  
- `COLLEGE#mit` → Find participants from specific college

## Access Patterns & Queries

### 1. User Registration Flow

#### Check if email exists
```python
# Query GSI1
response = dynamodb.query(
    IndexName='GSI1',
    KeyConditionExpression='GSI1PK = :email',
    ExpressionAttributeValues={
        ':email': 'EMAIL#user@example.com'
    }
)
```

#### Create new participant
```python
# Put item in main table
dynamodb.put_item(
    Item={
        'PK': 'PARTICIPANT#' + participant_id,
        'SK': 'PROFILE',
        'GSI1PK': 'EMAIL#' + email,
        # ... other attributes
    }
)
```

### 2. Team Management

#### Get team with all members
```python
# First get team details
team = dynamodb.get_item(
    Key={
        'PK': 'TEAM#' + team_id,
        'SK': 'PROFILE'
    }
)

# Then get all team members via GSI2
members = dynamodb.query(
    IndexName='GSI2', 
    KeyConditionExpression='GSI2PK = :team',
    ExpressionAttributeValues={
        ':team': 'TEAM#' + team_id
    }
)
```

### 3. Payment Processing

#### Update payment status atomically
```python
# Transaction to update both team and payment
with dynamodb.transact_write_items() as transaction:
    # Update team payment status
    transaction.update(
        Key={'PK': 'TEAM#' + team_id, 'SK': 'PROFILE'},
        UpdateExpression='SET payment_status = :status',
        ExpressionAttributeValues={':status': 'paid'}
    )
    
    # Create payment record
    transaction.put(
        Item={
            'PK': 'PAYMENT#' + payment_id,
            'SK': 'TRANSACTION',
            # ... payment details
        }
    )
```

### 4. Admin Queries

#### Get all paid teams
```python
response = dynamodb.query(
    IndexName='GSI3',
    KeyConditionExpression='GSI3PK = :status',
    ExpressionAttributeValues={
        ':status': 'PAYMENT_STATUS#paid'
    }
)
```

#### Get statistics by track
```python
response = dynamodb.query(
    IndexName='GSI3',
    KeyConditionExpression='GSI3PK = :track', 
    ExpressionAttributeValues={
        ':track': 'TRACK#ai-ml'
    }
)
```

## Data Consistency & Transactions

### ACID Properties
- Use DynamoDB transactions for multi-item operations
- Conditional writes to prevent race conditions
- Optimistic locking with version numbers

### Example: Team Registration Transaction
```python
def register_team(team_data, members_data):
    with dynamodb.transact_write_items() as transaction:
        # 1. Create team
        transaction.put(
            Item=team_item,
            ConditionExpression='attribute_not_exists(PK)'
        )
        
        # 2. Create all members
        for member in members_data:
            transaction.put(
                Item=member_item,
                ConditionExpression='attribute_not_exists(GSI1PK)'  # Email unique
            )
        
        # 3. Create payment record
        transaction.put(Item=payment_item)
```

## Performance Optimization

### Hot Partitions
- Avoid sequential IDs that create hot partitions
- Use UUIDs for even distribution
- Monitor partition metrics

### Query Optimization
- Use projection expressions to fetch only needed attributes
- Implement pagination for large result sets
- Cache frequently accessed data

### Cost Optimization
- Use On-Demand billing for unpredictable traffic
- Implement TTL for temporary data
- Archive old data to S3

## Backup & Recovery

### Point-in-Time Recovery
- Enable PITR for main table
- 35-day recovery window
- No impact on performance

### Backup Strategy
```bash
# Automated daily backups
aws dynamodb put-backup-policy \
  --table-name codekurukshetra_main \
  --backup-policy BillingMode=PROVISIONED,BackupType=SYSTEM
```

## Monitoring & Alerting

### CloudWatch Metrics
- Read/Write capacity utilization
- Throttling events
- System errors
- Hot partition detection

### Custom Metrics
- Registration rate
- Payment success rate
- User activity patterns

### Alerts
```json
{
  "MetricName": "ThrottledRequests",
  "Threshold": 10,
  "ComparisonOperator": "GreaterThanThreshold",
  "AlarmActions": ["arn:aws:sns:region:account:topic"]
}
```

## Data Migration & Seeding

### Initial Setup Script
```python
def setup_database():
    # Create main table
    create_table('codekurukshetra_main')
    
    # Create GSIs
    create_gsi('GSI1', 'GSI1PK', 'GSI1SK') 
    create_gsi('GSI2', 'GSI2PK', 'GSI2SK')
    create_gsi('GSI3', 'GSI3PK', 'GSI3SK')
    
    # Seed configuration
    seed_config_data()
    
    # Set up monitoring
    setup_cloudwatch_alarms()
```

### Data Validation
- Schema validation before writes
- Data integrity checks
- Referential integrity enforcement

## Security Considerations

### Access Control
- IAM roles for service access
- VPC endpoints for private access
- Encryption at rest and in transit

### Data Protection
- PII field encryption
- Access logging
- Data masking for non-prod environments

### Compliance
- GDPR data deletion capabilities
- Audit trail maintenance
- Data retention policies
