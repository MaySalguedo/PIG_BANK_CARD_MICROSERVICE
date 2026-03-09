output "api_base_url" {
  value       = aws_api_gateway_stage.api_stage.invoke_url
  description = "API Gateway base URL"
}
output "sqs_url" {
  value = aws_sqs_queue.notification_queue.url
}