resource "aws_api_gateway_rest_api" "api" {
  name = "pig-bank-card-api"
}

# --- RUTAS PADRE ---
resource "aws_api_gateway_resource" "card" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "card"
}
resource "aws_api_gateway_resource" "transactions" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "transactions"
}

# --- ENDPOINTS /card/... ---
# POST /card/request
resource "aws_api_gateway_resource" "card_request" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.card.id
  path_part   = "request"
}
resource "aws_api_gateway_method" "post_request" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.card_request.id
  http_method = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "int_request" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.card_request.id
  http_method = aws_api_gateway_method.post_request.http_method
  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = aws_lambda_function.create_card.invoke_arn
}

# POST /card/activate
resource "aws_api_gateway_resource" "card_activate" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.card.id
  path_part   = "activate"
}
resource "aws_api_gateway_method" "post_activate" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.card_activate.id
  http_method = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "int_activate" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.card_activate.id
  http_method = aws_api_gateway_method.post_activate.http_method
  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = aws_lambda_function.activate_card.invoke_arn
}

# POST /card/paid/{card_id}
resource "aws_api_gateway_resource" "card_paid" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.card.id
  path_part   = "paid"
}
resource "aws_api_gateway_resource" "card_paid_id" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.card_paid.id
  path_part   = "{card_id}"
}
resource "aws_api_gateway_method" "post_paid" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.card_paid_id.id
  http_method = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "int_paid" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.card_paid_id.id
  http_method = aws_api_gateway_method.post_paid.http_method
  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = aws_lambda_function.paid_credit.invoke_arn
}

# --- ENDPOINTS /transactions/... ---
# POST /transactions/purchase
resource "aws_api_gateway_resource" "tx_purchase" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.transactions.id
  path_part   = "purchase"
}
resource "aws_api_gateway_method" "post_purchase" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.tx_purchase.id
  http_method = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "int_purchase" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.tx_purchase.id
  http_method = aws_api_gateway_method.post_purchase.http_method
  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = aws_lambda_function.purchase_card.invoke_arn
}

# POST /transactions/save/{card_id}
resource "aws_api_gateway_resource" "tx_save" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.transactions.id
  path_part   = "save"
}
resource "aws_api_gateway_resource" "tx_save_id" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.tx_save.id
  path_part   = "{card_id}"
}
resource "aws_api_gateway_method" "post_save" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.tx_save_id.id
  http_method = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "int_save" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.tx_save_id.id
  http_method = aws_api_gateway_method.post_save.http_method
  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = aws_lambda_function.save_transaction.invoke_arn
}

# --- PERMISOS GLOBALES PARA API GATEWAY ---
resource "aws_lambda_permission" "apigw" {
  for_each = {
    "create"   = aws_lambda_function.create_card.function_name
    "activate" = aws_lambda_function.activate_card.function_name
    "purchase" = aws_lambda_function.purchase_card.function_name
    "save"     = aws_lambda_function.save_transaction.function_name
    "paid"     = aws_lambda_function.paid_credit.function_name
  }
  statement_id  = "AllowExecutionFromAPIGateway_${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = each.value
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# --- DESPLIEGUE ---
resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on = [
    aws_api_gateway_integration.int_request,
    aws_api_gateway_integration.int_activate,
    aws_api_gateway_integration.int_purchase,
    aws_api_gateway_integration.int_save,
    aws_api_gateway_integration.int_paid
  ]
  rest_api_id = aws_api_gateway_rest_api.api.id
}

resource "aws_api_gateway_stage" "api_stage" {
  deployment_id = aws_api_gateway_deployment.api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
  stage_name    = "prod"
}