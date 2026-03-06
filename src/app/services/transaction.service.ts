import { v4 as uuidv4 } from "uuid";
import { TransactionType } from '@typos/transaction-type.type';
import { TransactionRepository } from "@typos/transaction-repository.type";
import { Transaction } from '@entities/transaction.entity';
import { CardRepository } from '@typos/card-repository.type';
import { NotificationEvent } from '@models/notification-event.model';
import { INotificationStatement } from '@statement/notification/notification-statement.interface';

export class TransactionService<

	tRepository extends TransactionRepository,
	cRepository extends CardRepository,
	notiEvent extends INotificationStatement<NotificationEvent<string, any>>

>{

	public constructor(

		private readonly cardRepository: cRepository,
		private readonly transactionRepository: tRepository,
		private readonly notificationPort: notiEvent

	) {}

	public async processPurchase(cardId: string, merchant: string, amount: number): Promise<void> {

		const card = await this.cardRepository.findOne(cardId);
		if (!card) throw new Error("Card not found");
		if (card.status !== "ACTIVATED") throw new Error("Card is not activated");

		if (card.type === "DEBIT") {

			if (card.balance < amount) {

				throw new Error("Insufficient funds in debit card");

			}

			card.balance -= amount;

		} else if (card.type === "CREDIT") {

			if (card.balance < amount) {

				throw new Error("Transaction exceeds credit card limit");

			}

			card.balance -= amount; 

		}

		const transaction: Transaction = {

			uuid: uuidv4(),
			cardId,
			amount,
			merchant,
			type: "PURCHASE",
			createdAt: new Date().toISOString(),

		};

		await this.transactionRepository.save(transaction);
		await this.cardRepository.updateBalance(cardId, card.balance);

		await this.notificationPort.send({
			type: "TRANSACTION.PURCHASE",
			data: {
				date: transaction.createdAt,
				merchant: transaction.merchant,
				cardId: transaction.cardId,
				amount: transaction.amount,
			},
		});
	}
}