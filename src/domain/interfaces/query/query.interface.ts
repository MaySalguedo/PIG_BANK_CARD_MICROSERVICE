import { Entity } from '@models/entity.model';

export interface IQuery<T extends Entity> {

	findOne(uuid: T['uuid']): Promise<T | undefined>

}