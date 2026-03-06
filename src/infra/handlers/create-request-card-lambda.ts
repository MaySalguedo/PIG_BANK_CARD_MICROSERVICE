import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbCardAdapter } from "@adapters/dynamo-db-card.adapter";
import { SqsNotificationAdapter } from "@adapters/sqs-notification.adapter";
import { CardService } from "@services/card.service";
import { CardType } from '@typos/card-type.type';

const cardRepository = new DynamoDbCardAdapter();
const notificationAdapter = new SqsNotificationAdapter();
const cardService = new CardService(cardRepository, notificationAdapter);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	try {

		const body = JSON.parse(event.body || "{}");

		const userId = body.userId;
		const requestType = body.request as CardType;

		if (!userId || !requestType) {
			console.error("Payload inválido", body);
			return {
				statusCode: 400,
				body: JSON.stringify({ message: "userId & request are required fields" })
			};
		}

		await cardService.createCard(userId, requestType);

		const message = `Card ${requestType} processed successfully for user ${userId}`

		console.log(message);

		return {
			statusCode: 201,
			body: JSON.stringify({ 
				message: message
			})
		};

	} catch (error: any) {
		console.error("Error while processing card request:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.message || "Internal Server Error" })
		};
	}
};