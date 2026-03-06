import { Card } from '@entities/card.entity';
import { IStatement } from '@statement/statement.interface';

export interface ICardStatement<T extends Card = Card> extends IStatement<T> {

	updateStatus(uuid: T['uuid'], status: T['status']): Promise<void>;
	updateBalance(uuid: T['uuid'], newBalance: T['balance']): Promise<void>;

}