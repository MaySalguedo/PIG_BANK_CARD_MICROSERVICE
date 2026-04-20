import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbCardAdapter } from "@adapters/dynamo-db-card.adapter";
import { SqsNotificationAdapter } from "@adapters/sqs-notification.adapter";
import { CardService } from "@services/card.service";

const cardRepository = new DynamoDbCardAdapter();
const notificationAdapter = new SqsNotificationAdapter();
const cardService = new CardService(cardRepository, notificationAdapter);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

	try {

		const uuid = event.pathParameters?.uuid;

        if (!uuid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "The 'uuid' parameter is required in the path." })
            };
        }

        const card = await cardService.findCard(uuid);

        if (!card) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: `Card with uuid ${uuid} not found.` })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(card)
        };

	} catch (error: any) {
		console.error("Error while processing card request:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.message || "Internal Server Error" })
		};
	}
};