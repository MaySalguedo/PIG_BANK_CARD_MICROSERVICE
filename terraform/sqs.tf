resource "aws_sqs_queue" "notification_queue" {
  name = "notification-email-sqs"
}