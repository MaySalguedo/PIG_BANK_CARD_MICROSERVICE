# Variable local para reutilizar configuraciones comunes
locals {
  lambda_env = {
    AWS_SQS_QUEUE_URL          = aws_sqs_queue.notification_queue.url
  }
}

resource "aws_lambda_function" "create_card" {
  function_name    = "create-request-card-lambda"
  runtime          = "nodejs24.x"
  handler          = "dist/create-request-card-lambda.handler"
  role             = aws_iam_role.lambda_role.arn
  filename         = var.lambda_zip_path
  source_code_hash = filebase64sha256(var.lambda_zip_path) # <- ESTO FUERZA LA ACTUALIZACIÓN
  environment { variables = local.lambda_env }
}

resource "aws_lambda_function" "activate_card" {
  function_name    = "card-activate-lambda"
  runtime          = "nodejs24.x"
  handler          = "dist/card-activate-lambda.handler"
  role             = aws_iam_role.lambda_role.arn
  filename         = var.lambda_zip_path
  source_code_hash = filebase64sha256(var.lambda_zip_path)
  environment { variables = local.lambda_env }
}

resource "aws_lambda_function" "purchase_card" {
  function_name    = "card-purchase-lambda"
  runtime          = "nodejs24.x"
  handler          = "dist/card-purchase-lambda.handler"
  role             = aws_iam_role.lambda_role.arn
  filename         = var.lambda_zip_path
  source_code_hash = filebase64sha256(var.lambda_zip_path)
  environment { variables = local.lambda_env }
}

resource "aws_lambda_function" "save_transaction" {
  function_name    = "card-transaction-save-lambda"
  runtime          = "nodejs24.x"
  handler          = "dist/card-transaction-save-lambda.handler"
  role             = aws_iam_role.lambda_role.arn
  filename         = var.lambda_zip_path
  source_code_hash = filebase64sha256(var.lambda_zip_path)
  environment { variables = local.lambda_env }
}

resource "aws_lambda_function" "paid_credit" {
  function_name    = "card-paid-credit-lambda"
  runtime          = "nodejs24.x"
  handler          = "dist/card-paid-credit-card-lambda.handler"
  role             = aws_iam_role.lambda_role.arn
  filename         = var.lambda_zip_path
  source_code_hash = filebase64sha256(var.lambda_zip_path)
  environment { variables = local.lambda_env }
}