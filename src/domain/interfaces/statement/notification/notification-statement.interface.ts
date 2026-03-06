import { NotificationEvent } from '@models/notification-event.model';

export interface INotificationStatement<T extends NotificationEvent<string, unknown>> {

	send(event: T): Promise<void>;

}