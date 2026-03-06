
provider "aws" {
  region = "us-east-1"
}

# 1. Tabla de Tarjetas
resource "aws_dynamodb_table" "card_table" {
  name         = "card-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "uuid"

  attribute {
    name = "uuid"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  global_secondary_index {
    name               = "UserIdIndex"
    hash_key           = "user_id"
    projection_type    = "ALL"
  }
}

# 2. Tabla de Transacciones
resource "aws_dynamodb_table" "transaction_table" {
  name         = "transaction-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "uuid"

  attribute {
    name = "uuid"
    type = "S"
  }
}

# 3. Tabla de Errores de Tarjetas
resource "aws_dynamodb_table" "card_table_error" {
  name         = "card-table-error"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "uuid"

  attribute {
    name = "uuid"
    type = "S"
  }
}

# 4. Cola SQS para Notificaciones
resource "aws_sqs_queue" "notification_queue" {
  name = "notification-email-sqs"
}

# 5. Rol de IAM para Lambda
resource "aws_iam_role" "lambda_exec_role" {
  name = "pig_bank_lambda_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# 6. Permisos del Rol
resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess" 
}

# 7. Función Lambda: Create Request Card
resource "aws_lambda_function" "create_card_lambda" {
  function_name    = "create-request-card-lambda"
  runtime          = "nodejs20.x"
  handler          = "dist/handler.handler"
  role             = aws_iam_role.lambda_exec_role.arn
  filename         = "lambda.zip"
  source_code_hash = filebase64sha256("lambda.zip")
  environment {
    variables = {
      AWS_SQS_QUEUE_URL = aws_sqs_queue.notification_queue.url
    }
  }
}

# 8. API Gateway REST API
resource "aws_api_gateway_rest_api" "pig_bank_api" {
  name        = "pig-bank-card-api"
  description = "API Gateway para el microservicio de Tarjetas"
}

# 9. Recurso padre: /card
resource "aws_api_gateway_resource" "card_resource" {
  rest_api_id = aws_api_gateway_rest_api.pig_bank_api.id
  parent_id   = aws_api_gateway_rest_api.pig_bank_api.root_resource_id
  path_part   = "card"
}

# 10. Recurso hijo: /card/request
resource "aws_api_gateway_resource" "card_request_resource" {
  rest_api_id = aws_api_gateway_rest_api.pig_bank_api.id
  parent_id   = aws_api_gateway_resource.card_resource.id
  path_part   = "request"
}

# 11. Método HTTP: POST
resource "aws_api_gateway_method" "post_card_request" {
  rest_api_id   = aws_api_gateway_rest_api.pig_bank_api.id
  resource_id   = aws_api_gateway_resource.card_request_resource.id
  http_method   = "POST"
  authorization = "NONE" # La validación del token de Auth la harás en el código
}

# 12. Integración de API Gateway con Lambda (Modo Proxy)
resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.pig_bank_api.id
  resource_id             = aws_api_gateway_resource.card_request_resource.id
  http_method             = aws_api_gateway_method.post_card_request.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.create_card_lambda.invoke_arn
}

# 13. Permiso de seguridad para que API Gateway ejecute la Lambda
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_card_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.pig_bank_api.execution_arn}/*/*"
}

# 14. Despliegue de la API y creación del entorno (prod)
resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on  = [aws_api_gateway_integration.lambda_integration]
  rest_api_id = aws_api_gateway_rest_api.pig_bank_api.id
}

resource "aws_api_gateway_stage" "api_stage" {
  deployment_id = aws_api_gateway_deployment.api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.pig_bank_api.id
  stage_name    = "prod"
}

# 15. Imprimir la URL pública en la terminal
output "api_url" {
  value       = "${aws_api_gateway_stage.api_stage.invoke_url}/card/request"
  description = "URL publica para hacer peticiones POST"
}

output "sqs_url" {
  value = aws_sqs_queue.notification_queue.url
}