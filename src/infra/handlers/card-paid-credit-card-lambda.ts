import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbCardAdapter } from "@adapters/dynamo-db-card.adapter";
import { DynamoDbTransactionAdapter } from "@adapters/dynamo-db-transaction.adapter";
import { SqsNotificationAdapter } from "@adapters/sqs-notification.adapter";
import { TransactionService } from "@services/transaction.service";

const cardRepository = new DynamoDbCardAdapter();
const transactionRepository = new DynamoDbTransactionAdapter();
const notificationAdapter = new SqsNotificationAdapter();

const transactionService = new TransactionService(cardRepository, transactionRepository, notificationAdapter);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	try {
		const cardId = event.pathParameters?.card_id;
		const body = JSON.parse(event.body || "{}");
		const { amount } = body;

		if (!cardId || typeof amount !== 'number' || amount <= 0) {
			return {
				statusCode: 400,
				body: JSON.stringify({ message: "card_id and amount are required" })
			};
		}

		await transactionService.payCreditCard(cardId, amount);

		return {
			statusCode: 201,
			body: JSON.stringify({ message: "Credit card payment recieved succesfully" })
		};
	} catch (error: any) {
		console.error("Payment Error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.message || "Internal Server Error" })
		};
	}
};