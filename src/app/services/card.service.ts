import { v4 as uuidv4 } from "uuid";
import { CardType } from '@typos/card-type.type';
import { CardStatus } from '@typos/card-status.type';
import { CardRepository } from '@typos/card-repository.type';
import { Card } from '@entities/card.entity';
import { NotificationEvent } from '@models/notification-event.model';
import { INotificationStatement } from '@statement/notification/notification-statement.interface';

export class CardService<

	cRepository extends CardRepository,
	notiEvent extends INotificationStatement<NotificationEvent<string, any>>

>{

	public constructor(

		private readonly cardRepository: cRepository,
		private readonly notificationPort: notiEvent

	) {}

	public async createCard(userId: string, type: CardType): Promise<Card['uuid']> {

		let status: CardStatus = "PENDING";
		let balance = 0;

		if (type === "CREDIT") {

			const score = Math.floor(Math.random() * 101);
			balance = 100 + (score / 100) * (10000000 - 100);

		} else if (type === "DEBIT") {

			status = "ACTIVATED";
			balance = 0;

		}

		const newCard: Card = {

			uuid: uuidv4(),
			user_id: userId,
			type,
			status,
			balance,
			createdAt: new Date().toISOString(),

		};

		await this.cardRepository.save(newCard);

		await this.notificationPort.send({

			type: "CARD.CREATE",
			data: {
				date: newCard.createdAt,
				type: newCard.type,
				amount: newCard.balance,
			},

		});

		return newCard.uuid;

	}

	public async activateCard(userId: string, transactionCount: number): Promise<void> {

		if (transactionCount >= 10) {

			const cards = await this.cardRepository.findAllByUserId(userId);
			const pendingCreditCard = cards.find(c => c.status === "PENDING" && c.type === "CREDIT");

			if (!pendingCreditCard) throw new Error("No pending credit card found");

			await this.cardRepository.updateStatus(pendingCreditCard.uuid, "ACTIVATED");

			await this.notificationPort.send({
				type: "CARD.ACTIVATE",
				data: {
					date: new Date().toISOString(),
					type: "CREDIT",
					amount: pendingCreditCard.balance,
				},
			});
		}

	}

}