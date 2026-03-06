import { Transaction } from '@entities/transaction.entity';
import { Card } from '@entities/card.entity';
import { IQuery } from '@query/query.interface';

export interface ITransactionQuery<T extends Transaction = Transaction> extends IQuery<T> {

	countAllByUserId(userId: Card['user_id']): Promise<number>;
	findAllByCardIdAndDateRange(cardId: Card['uuid'], start: string, end: string): Promise<Array<T>>;

}