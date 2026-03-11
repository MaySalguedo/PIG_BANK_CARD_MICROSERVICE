import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbCardAdapter } from "@adapters/dynamo-db-card.adapter";
import { DynamoDbTransactionAdapter } from "@adapters/dynamo-db-transaction.adapter";
import { S3ReportAdapter } from "@adapters/s3-report.adapter";
import { SqsNotificationAdapter } from "@adapters/sqs-notification.adapter";
import { CardReportService } from "@services/card-report.service";

const cardRepository = new DynamoDbCardAdapter();
const transactionRepository = new DynamoDbTransactionAdapter();
const reportStorage = new S3ReportAdapter();
const notificationAdapter = new SqsNotificationAdapter();

const cardReportService = new CardReportService(
  cardRepository,
  transactionRepository,
  reportStorage,
  notificationAdapter
);

const parseJsonBody = (body: string | null): Record<string, string> => {
  if (!body) {
    return {};
  }

  try {
    return JSON.parse(body) as Record<string, string>;
  } catch {
    return {};
  }
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const cardId = event.pathParameters?.card_id;
    const parsedBody = parseJsonBody(event.body);
    const start = event.queryStringParameters?.start ?? parsedBody.start;
    const end = event.queryStringParameters?.end ?? parsedBody.end;

    if (!cardId || !start || !end) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            "card_id, start and end are required. Use query params (?start=...&end=...) or a JSON body.",
        }),
      };
    }

    const report = await cardReportService.generateReport(cardId, start, end);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Report generated successfully",
        cardId: report.cardId,
        start: report.start,
        end: report.end,
        generatedAt: report.generatedAt,
        transactionsCount: report.transactionsCount,
        reportUrl: report.reportUrl,
      }),
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    const statusCode =
      message === "Card not found"
        ? 404
        : [
            "start and end must be valid ISO date strings",
            "start date must be lower than or equal to end date",
          ].includes(message)
        ? 400
        : 500;

    console.error("Error while generating card report:", error);

    return {
      statusCode,
      body: JSON.stringify({ error: message }),
    };
  }
};