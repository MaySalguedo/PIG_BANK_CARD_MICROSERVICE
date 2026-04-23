import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbCardAdapter } from "@adapters/dynamo-db-card.adapter";
import { corsHeaders } from "@infra/http/cors";

const cardRepository = new DynamoDbCardAdapter();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.user_id;

    if (!userId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "user_id is required" }),
      };
    }

    const cards = await cardRepository.findAllByUserId(userId);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(cards),
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    console.error("Error while listing user cards:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: message }),
    };
  }
};
