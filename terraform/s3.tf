data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "transactions_report_bucket" {
  bucket = "pig-bank-transactions-report-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_public_access_block" "transactions_report_bucket_pab" {
  bucket = aws_s3_bucket.transactions_report_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}