import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { CardType } from '@typos/card-type.type';
import { CardStatus } from '@typos/card-status.type';
import { CardRepository } from '@typos/card-repository.type';
import { Card } from '@entities/card.entity';

export class DynamoDbCardAdapter implements CardRepository {

	private docClient: DynamoDBDocumentClient;
	private tableName = "card-table";

	public constructor() {

		const client = new DynamoDBClient({});
		this.docClient = DynamoDBDocumentClient.from(client);

	}

	public async save(card: Card): Promise<void> {

		await this.docClient.send(new PutCommand({

			TableName: this.tableName,
			Item: card

		}));

	}

	public async findOne(uuid: string): Promise<Card | undefined> {
		const result = await this.docClient.send(new GetCommand({
			TableName: this.tableName,
			Key: { uuid }
		}));
		return (result.Item as Card) || undefined;
	}

	public async findAllByUserId(userId: string): Promise<Array<Card>> {

		const result = await this.docClient.send(new QueryCommand({
			TableName: this.tableName,
			IndexName: "UserIdIndex",
			KeyConditionExpression: "user_id = :uid",
			ExpressionAttributeValues: { ":uid": userId }
		}));
		return (result.Items as Card[]) || [];
	}

	public async updateStatus(uuid: string, status: CardStatus): Promise<void> {
		await this.docClient.send(new UpdateCommand({
			TableName: this.tableName,
			Key: { uuid },
			UpdateExpression: "set #status = :s",
			ExpressionAttributeNames: { "#status": "status" },
			ExpressionAttributeValues: { ":s": status }
		}));
	}

	public async updateBalance(uuid: string, newBalance: number): Promise<void> {
		await this.docClient.send(new UpdateCommand({
			TableName: this.tableName,
			Key: { uuid },
			UpdateExpression: "set balance = :b",
			ExpressionAttributeValues: { ":b": newBalance }
		}));
	}

}