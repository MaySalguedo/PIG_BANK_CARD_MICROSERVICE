import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbCardAdapter } from "@adapters/dynamo-db-card.adapter";
import { DynamoDbTransactionAdapter } from "@adapters/dynamo-db-transaction.adapter";
import { SqsNotificationAdapter } from "@adapters/sqs-notification.adapter";
import { TransactionService } from "@services/transaction.service";
import { corsHeaders } from "@infra/http/cors";

const cardRepository = new DynamoDbCardAdapter();
const transactionRepository = new DynamoDbTransactionAdapter();
const notificationAdapter = new SqsNotificationAdapter();

const transactionService = new TransactionService(cardRepository, transactionRepository, notificationAdapter);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	try {
		const cardId = event.pathParameters?.card_id;
		const body = JSON.parse(event.body || "{}");
		const { amount } = body;
		const merchant = body.merchant || "PIG_BANK_DEPOSIT";

		if (!cardId || typeof amount !== 'number' || amount <= 0) {
			return {
				statusCode: 400,
				headers: corsHeaders,
				body: JSON.stringify({ message: "card_id and amount are required" })
			};
		}

		await transactionService.saveMoney(cardId, amount, merchant);

		return {
			statusCode: 201,
			headers: corsHeaders,
			body: JSON.stringify({ message: "New balance added successfully" })
		};
	} catch (error: any) {
		console.error("Error while addind balance:", error);
		return {
			statusCode: error.message.includes("DEBIT") ? 400 : 500,
			headers: corsHeaders,
			body: JSON.stringify({ error: error.message || "Internal Server Error" })
		};
	}
};
