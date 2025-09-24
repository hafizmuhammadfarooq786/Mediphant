# DynamoDB Single-Table Design for Mediphant

## Overview

This document outlines a single-table design for DynamoDB to replace the in-memory stores used in the current implementation. This approach follows AWS best practices for DynamoDB design patterns.

## Table Schema

**Table Name**: `mediphant-data`

| Attribute | Type | Description |
|-----------|------|-------------|
| PK | String | Partition Key - Entity identifier |
| SK | String | Sort Key - Entity type/timestamp |
| GSI1PK | String | Global Secondary Index 1 Partition Key |
| GSI1SK | String | Global Secondary Index 1 Sort Key |
| EntityType | String | Type of entity (QUERY, USER, RATE_LIMIT) |
| TTL | Number | Time-to-live for automatic cleanup |
| Data | Map | Entity-specific data |

## Access Patterns

### 1. Query History Storage

**Write Pattern**: Store interaction queries
```
PK: "QUERY#<timestamp>"
SK: "METADATA"
GSI1PK: "USER#<session_id>"
GSI1SK: "QUERY#<timestamp>"
EntityType: "QUERY"
TTL: <timestamp + 30 days>
Data: {
  "medA": "warfarin",
  "medB": "ibuprofen",
  "isPotentiallyRisky": true,
  "reason": "increased bleeding risk",
  "timestamp": "2024-09-24T10:30:00Z",
  "sessionId": "session_123"
}
```

**Read Pattern**: Get recent queries for user
```
Query GSI1:
  GSI1PK = "USER#<session_id>"
  GSI1SK begins_with "QUERY#"
  ScanIndexForward = false
  Limit = 10
```

### 2. Rate Limiting

**Write Pattern**: Track API calls per IP
```
PK: "RATE_LIMIT#<client_ip>"
SK: "WINDOW#<window_start_timestamp>"
EntityType: "RATE_LIMIT"
TTL: <window_start + 1 hour>
Data: {
  "count": 15,
  "windowStart": "2024-09-24T10:00:00Z",
  "windowEnd": "2024-09-24T11:00:00Z"
}
```

**Read Pattern**: Check current rate limit
```
Query:
  PK = "RATE_LIMIT#<client_ip>"
  SK begins_with "WINDOW#"
  ScanIndexForward = false
  Limit = 1
```

### 3. FAQ Search Analytics (Future)

**Write Pattern**: Track search queries
```
PK: "FAQ_SEARCH#<date>"
SK: "QUERY#<timestamp>#<query_hash>"
EntityType: "FAQ_SEARCH"
Data: {
  "query": "medication adherence",
  "matches": 3,
  "searchTime": 150,
  "timestamp": "2024-09-24T10:30:00Z"
}
```

### 4. User Sessions (Future)

**Write Pattern**: Store user session data
```
PK: "USER#<user_id>"
SK: "SESSION#<session_id>"
GSI1PK: "SESSION#<session_id>"
GSI1SK: "USER#<user_id>"
EntityType: "SESSION"
TTL: <session_expiry>
Data: {
  "createdAt": "2024-09-24T10:00:00Z",
  "lastActivity": "2024-09-24T10:30:00Z",
  "queryCount": 5
}
```

## Global Secondary Index (GSI1)

**Purpose**: Enable reverse lookups and cross-entity queries

**Key Schema**:
- GSI1PK (Partition Key)
- GSI1SK (Sort Key)

**Use Cases**:
- Find all queries for a user session
- Find session by session ID
- Analytics queries across entities

## Implementation Benefits

### 1. Cost Efficiency
- Single table reduces DynamoDB costs
- TTL automatically cleans up old data
- Efficient queries with minimal reads

### 2. Scalability
- Partition key distribution prevents hot partitions
- GSI enables efficient secondary access patterns
- Auto-scaling handles traffic spikes

### 3. Performance
- Single-digit millisecond latency
- Predictable performance at scale
- No join operations needed

## Migration Strategy

### Phase 1: Parallel Writes
- Write to both in-memory store and DynamoDB
- Read from in-memory store (no disruption)
- Monitor DynamoDB performance

### Phase 2: Gradual Read Migration
- Start reading from DynamoDB for new sessions
- Fallback to in-memory for cache misses
- Monitor error rates and latency

### Phase 3: Full Migration
- Switch all reads to DynamoDB
- Remove in-memory stores
- Implement DynamoDB-only writes

## Code Example

```typescript
// DynamoDB Service
import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

export class DynamoDBQueryHistoryStore {
  private client: DynamoDBClient;
  private tableName = 'mediphant-data';

  async addQuery(medA: string, medB: string, isPotentiallyRisky: boolean, reason: string, sessionId: string) {
    const timestamp = new Date().toISOString();
    const ttl = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days

    await this.client.send(new PutItemCommand({
      TableName: this.tableName,
      Item: marshall({
        PK: `QUERY#${timestamp}`,
        SK: 'METADATA',
        GSI1PK: `USER#${sessionId}`,
        GSI1SK: `QUERY#${timestamp}`,
        EntityType: 'QUERY',
        TTL: ttl,
        Data: {
          medA,
          medB,
          isPotentiallyRisky,
          reason,
          timestamp,
          sessionId
        }
      })
    }));
  }

  async getRecentQueries(sessionId: string): Promise<QueryHistoryItem[]> {
    const response = await this.client.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: marshall({
        ':pk': `USER#${sessionId}`,
        ':sk': 'QUERY#'
      }),
      ScanIndexForward: false,
      Limit: 10
    }));

    return response.Items?.map(item => {
      const data = unmarshall(item);
      return {
        id: data.PK.split('#')[1],
        ...data.Data
      };
    }) || [];
  }
}
```

## Monitoring & Observability

### CloudWatch Metrics
- Read/Write Capacity Units
- Throttling events
- Item count and table size
- GSI utilization

### Application Metrics
- Query latency (P50, P90, P99)
- Error rates by operation
- Cache hit/miss ratios during migration

### Alarms
- High throttling rates
- Elevated error rates
- Capacity utilization > 80%

## Cost Estimation

**Assumptions**:
- 1,000 queries/day
- 30-day retention
- 1KB average item size

**Monthly Costs** (us-east-1):
- Storage: ~$0.50 (30,000 items × 1KB × $0.25/GB)
- Reads: ~$0.50 (30,000 RCUs × $0.125/million)
- Writes: ~$0.13 (1,000 WCUs × $1.25/million)
- **Total: ~$1.13/month**

This design provides a robust, scalable foundation for the Mediphant application while maintaining cost efficiency and performance.