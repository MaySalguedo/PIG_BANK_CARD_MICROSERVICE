import { Entity } from '@models/entity.model';

export interface IStatement<T extends Entity> {

	save(entity: T): Promise<void>;

}