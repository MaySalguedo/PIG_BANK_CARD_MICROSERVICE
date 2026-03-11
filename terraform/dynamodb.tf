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
    name            = "UserIdIndex"
    hash_key        = "user_id"
    projection_type = "ALL"
  }
}

resource "aws_dynamodb_table" "transaction_table" {
  name         = "transaction-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "uuid"

  attribute {
    name = "uuid"
    type = "S"
  }

  attribute {
    name = "cardId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  global_secondary_index {
    name            = "CardIdCreatedAtIndex"
    hash_key        = "cardId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }
}

resource "aws_dynamodb_table" "card_table_error" {
  name         = "card-table-error"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "uuid"

  attribute {
    name = "uuid"
    type = "S"
  }
}