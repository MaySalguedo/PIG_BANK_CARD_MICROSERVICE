import { CardType } from '@typos/card-type.type';
import { CardStatus } from '@typos/card-status.type';
import { Entity } from '@models/entity.model';

export interface Card extends Entity {

	user_id: string,
	type: CardType,
	status: CardStatus,
	balance: number

}