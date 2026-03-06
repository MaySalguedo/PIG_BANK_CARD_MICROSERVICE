import { ITransactionQuery } from '@query/transaction/transaction-query.interface';
import { ITransactionStatement } from '@statement/transaction/transaction-statement.interface';

export type TransactionRepository = ITransactionQuery & ITransactionStatement;