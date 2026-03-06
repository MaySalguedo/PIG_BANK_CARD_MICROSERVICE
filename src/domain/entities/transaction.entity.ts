import { TransactionType } from '@typos/transaction-type.type';
import { Entity } from '@models/entity.model';

export interface Transaction extends Entity {

	cardId: string,
	amount: number,
	merchant: string,
	type: TransactionType

}