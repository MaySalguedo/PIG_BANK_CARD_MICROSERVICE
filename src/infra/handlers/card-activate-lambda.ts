import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbCardAdapter } from "@adapters/dynamo-db-card.adapter";
import { SqsNotificationAdapter } from "@adapters/sqs-notification.adapter";
import { CardService } from "@services/card.service";

const cardRepository = new DynamoDbCardAdapter();
const notificationAdapter = new SqsNotificationAdapter();
const cardService = new CardService(cardRepository, notificationAdapter);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	try {
		const body = JSON.parse(event.body || "{}");
		const { userId, transactionCount } = body;

		if (!userId || typeof transactionCount !== 'number') {
			return {
				statusCode: 400,
				body: JSON.stringify({ message: "userId and transactionCount are required" })
			};
		}

		await cardService.activateCard(userId, transactionCount);

		return {
			statusCode: 200,
			body: JSON.stringify({ message: `Activation card process completed for user: ${userId}` })
		};
	} catch (error: any) {
		console.error("Activation Error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.message || "Internal Server Error" })
		};
	}
};