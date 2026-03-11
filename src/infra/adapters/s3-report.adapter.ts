import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface UploadCsvInput {
  key: string;
  body: string;
}

export class S3ReportAdapter {
  private readonly s3Client = new S3Client({});
  private readonly bucketName = process.env.REPORT_BUCKET_NAME ?? "";
  private readonly signedUrlExpiresIn = Number(
    process.env.REPORT_URL_EXPIRES_SECONDS ?? "3600"
  );

  private getBucketName(): string {
    if (!this.bucketName) {
      throw new Error("REPORT_BUCKET_NAME environment variable is required");
    }

    return this.bucketName;
  }

  public async uploadCsv({ key, body }: UploadCsvInput): Promise<void> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.getBucketName(),
        Key: key,
        Body: body,
        ContentType: "text/csv; charset=utf-8",
      })
    );
  }

  public async createSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.getBucketName(),
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: this.signedUrlExpiresIn,
    });
  }
}