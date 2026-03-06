import { ICardQuery } from '@query/card/card-query.interface';
import { ICardStatement } from '@statement/card/card-statement.interface';

export type CardRepository = ICardQuery & ICardStatement;