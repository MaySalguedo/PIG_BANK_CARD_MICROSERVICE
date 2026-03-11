import { S3ReportAdapter } from "@adapters/s3-report.adapter";
import { Card } from "@entities/card.entity";
import { Transaction } from "@entities/transaction.entity";
import { NotificationEvent } from "@models/notification-event.model";
import { INotificationStatement } from "@statement/notification/notification-statement.interface";
import { CardRepository } from "@typos/card-repository.type";
import { TransactionRepository } from "@typos/transaction-repository.type";

export interface CardReportResult {
  cardId: string;
  reportKey: string;
  reportUrl: string;
  transactionsCount: number;
  start: string;
  end: string;
  generatedAt: string;
}

export class CardReportService<
  cRepository extends CardRepository,
  tRepository extends TransactionRepository,
  notiEvent extends INotificationStatement<NotificationEvent<string, any>>
> {
  public constructor(
    private readonly cardRepository: cRepository,
    private readonly transactionRepository: tRepository,
    private readonly reportStorage: S3ReportAdapter,
    private readonly notificationPort: notiEvent
  ) {}

  public async generateReport(
    cardId: string,
    start: string,
    end: string
  ): Promise<CardReportResult> {
    const card = await this.cardRepository.findOne(cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    const { normalizedStart, normalizedEnd } = this.validateDateRange(start, end);
    const transactions =
      await this.transactionRepository.findAllByCardIdAndDateRange(
        cardId,
        normalizedStart,
        normalizedEnd
      );

    const generatedAt = new Date().toISOString();
    const reportKey = this.buildReportKey(cardId, generatedAt);
    const csv = this.buildCsv(
      card,
      transactions,
      normalizedStart,
      normalizedEnd,
      generatedAt
    );

    await this.reportStorage.uploadCsv({
      key: reportKey,
      body: csv,
    });

    const reportUrl = await this.reportStorage.createSignedUrl(reportKey);

    await this.notificationPort.send({
      type: "REPORT.ACTIVITY",
      data: {
        date: generatedAt,
        url: reportUrl,
      },
    });

    return {
      cardId,
      reportKey,
      reportUrl,
      transactionsCount: transactions.length,
      start: normalizedStart,
      end: normalizedEnd,
      generatedAt,
    };
  }

  private validateDateRange(start: string, end: string): {
    normalizedStart: string;
    normalizedEnd: string;
  } {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      throw new Error("start and end must be valid ISO date strings");
    }

    if (startDate.getTime() > endDate.getTime()) {
      throw new Error("start date must be lower than or equal to end date");
    }

    return {
      normalizedStart: startDate.toISOString(),
      normalizedEnd: endDate.toISOString(),
    };
  }

  private buildReportKey(cardId: string, generatedAt: string): string {
    const safeTimestamp = generatedAt.replace(/[.:]/g, "-");
    return `reports/${cardId}/transactions-report-${safeTimestamp}.csv`;
  }

  private buildCsv(
    card: Card,
    transactions: Array<Transaction>,
    start: string,
    end: string,
    generatedAt: string
  ): string {
    const headers = [
      "reportGeneratedAt",
      "reportStart",
      "reportEnd",
      "cardUuid",
      "cardUserId",
      "cardType",
      "cardStatus",
      "transactionUuid",
      "transactionType",
      "merchant",
      "amount",
      "transactionCreatedAt",
    ];

    const rows = transactions.map((transaction) => [
      generatedAt,
      start,
      end,
      card.uuid,
      card.user_id,
      card.type,
      card.status,
      transaction.uuid,
      transaction.type,
      transaction.merchant,
      transaction.amount,
      transaction.createdAt,
    ]);

    const csvRows = [headers, ...rows].map((row) =>
      row.map((value) => this.escapeCsv(value)).join(",")
    );

    return `${csvRows.join("\n")}\n`;
  }

  private escapeCsv(value: string | number): string {
    const normalized = String(value);

    if (
      normalized.includes(",") ||
      normalized.includes("\n") ||
      normalized.includes('"')
    ) {
      return `"${normalized.replace(/"/g, '""')}"`;
    }

    return normalized;
  }
}