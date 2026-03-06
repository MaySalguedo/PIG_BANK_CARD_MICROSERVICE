import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { NotificationEvent } from '@models/notification-event.model';
import { INotificationStatement } from '@statement/notification/notification-statement.interface';

export class SqsNotificationAdapter implements INotificationStatement<NotificationEvent<string, any>> {

	private sqsClient: SQSClient;
	private queueUrl = process.env.AWS_SQS_QUEUE_URL; 

	public constructor() {

		this.sqsClient = new SQSClient({});

	}

	public async send(event: NotificationEvent<string, any>): Promise<void> {

		await this.sqsClient.send(new SendMessageCommand({
			QueueUrl: this.queueUrl,
			MessageBody: JSON.stringify(event)
		}));

	}

}