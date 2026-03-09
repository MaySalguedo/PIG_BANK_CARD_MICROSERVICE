provider "aws" {
  region = "us-east-1"
}

module "pig_bank_infrastructure" {
  source = "./terraform"
  lambda_zip_path = "${path.module}/lambda.zip" 
}

output "api_base_url" {
  value       = module.pig_bank_infrastructure.api_base_url
  description = "URL Base de tu API Gateway"
}

output "sqs_url" {
  value = module.pig_bank_infrastructure.sqs_url
}