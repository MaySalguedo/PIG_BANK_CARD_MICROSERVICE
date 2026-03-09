import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbCardAdapter } from "@adapters/dynamo-db-card.adapter";
import { DynamoDbTransactionAdapter } from "@adapters/dynamo-db-transaction.adapter";
import { SqsNotificationAdapter } from "@adapters/sqs-notification.adapter";
import { TransactionService } from "@services/transaction.service";

const cardRepository = new DynamoDbCardAdapter();
const transactionRepository = new DynamoDbTransactionAdapter();
const notificationAdapter = new SqsNotificationAdapter();

const transactionService = new TransactionService(
	cardRepository,
	transactionRepository,
	notificationAdapter
);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	try {
		const body = JSON.parse(event.body || "{}");
		const { cardId, merchant, amount } = body;

		if (!cardId || !merchant || typeof amount !== 'number' || amount <= 0) {
			return {
				statusCode: 400,
				body: JSON.stringify({ message: "cardId, merchant and amount (> 0) are required" })
			};
		}

		const uuid = await transactionService.processPurchase(cardId, merchant, amount);

		return {
			statusCode: 201,
			body: JSON.stringify({ transaction_uuid: uuid })
		};
	} catch (error: any) {
		console.error("Error en purchase:", error);

		const isBusinessError = ["Card not found", "Card is not activated", "Insufficient funds in debit card", "Transaction exceeds credit card limit"].includes(error.message);
		
		return {
			statusCode: isBusinessError ? 400 : 500,
			body: JSON.stringify({ error: error.message || "Error interno del servidor" })
		};
	}
};