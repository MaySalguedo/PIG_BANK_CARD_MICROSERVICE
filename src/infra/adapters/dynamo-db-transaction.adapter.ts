import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { Transaction } from "@entities/transaction.entity";
import { TransactionRepository } from "@typos/transaction-repository.type"; 

export class DynamoDbTransactionAdapter implements TransactionRepository {

	private docClient: DynamoDBDocumentClient
    private readonly tableName = "transaction-table";

	public constructor() {

		const client = new DynamoDBClient({});
		this.docClient = DynamoDBDocumentClient.from(client);

	}

    public async save(transaction: Transaction): Promise<void> {
        const command = new PutCommand({
            TableName: this.tableName,
            Item: transaction
        });

        await this.docClient.send(command);
    }
}