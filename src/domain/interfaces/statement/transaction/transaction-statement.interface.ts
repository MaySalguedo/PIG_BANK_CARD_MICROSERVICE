import { Transaction } from '@entities/transaction.entity';
import { IStatement } from '@statement/statement.interface';

export interface ITransactionStatement<T extends Transaction = Transaction> extends IStatement<Transaction> {}