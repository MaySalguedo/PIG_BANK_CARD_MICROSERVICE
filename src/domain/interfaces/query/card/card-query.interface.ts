import { Card } from '@entities/card.entity';
import { IQuery } from '@query/query.interface';

export interface ICardQuery<T extends Card = Card> extends IQuery<T> {

	findAllByUserId(userId: T['user_id']): Promise<Array<T>>;

}