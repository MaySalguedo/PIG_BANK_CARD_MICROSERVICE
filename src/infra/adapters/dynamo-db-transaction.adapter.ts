import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { Transaction } from "@entities/transaction.entity";
import { TransactionRepository } from "@typos/transaction-repository.type";

export class DynamoDbTransactionAdapter implements TransactionRepository {
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName = "transaction-table";
  private readonly cardDateIndexName = "CardIdCreatedAtIndex";

  public constructor() {
    const client = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(client);
  }

  public async save(transaction: Transaction): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: transaction,
    });

    await this.docClient.send(command);
  }

  public async findOne(uuid: string): Promise<Transaction | undefined> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { uuid },
    });

    const result = await this.docClient.send(command);
    return (result.Item as Transaction | undefined) ?? undefined;
  }

  public async countAllByUserId(): Promise<number> {
    throw new Error(
      "countAllByUserId is not implemented because transaction-table does not persist userId directly"
    );
  }

  public async findAllByCardIdAndDateRange(
    cardId: string,
    start: string,
    end: string
  ): Promise<Array<Transaction>> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: this.cardDateIndexName,
        KeyConditionExpression:
          "#cardId = :cardId AND #createdAt BETWEEN :start AND :end",
        ExpressionAttributeNames: {
          "#cardId": "cardId",
          "#createdAt": "createdAt",
        },
        ExpressionAttributeValues: {
          ":cardId": cardId,
          ":start": start,
          ":end": end,
        },
      });

      const result = await this.docClient.send(command);
      return (result.Items as Transaction[] | undefined) ?? [];
    } catch (error) {
      console.warn(
        "CardIdCreatedAtIndex query failed, falling back to table scan",
        error
      );

      const fallbackCommand = new ScanCommand({
        TableName: this.tableName,
        FilterExpression:
          "#cardId = :cardId AND #createdAt BETWEEN :start AND :end",
        ExpressionAttributeNames: {
          "#cardId": "cardId",
          "#createdAt": "createdAt",
        },
        ExpressionAttributeValues: {
          ":cardId": cardId,
          ":start": start,
          ":end": end,
        },
      });

      const fallbackResult = await this.docClient.send(fallbackCommand);
      const transactions =
        (fallbackResult.Items as Transaction[] | undefined) ?? [];

      return transactions.sort((left, right) =>
        left.createdAt.localeCompare(right.createdAt)
      );
    }
  }
}