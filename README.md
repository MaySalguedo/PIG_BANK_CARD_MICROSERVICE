<div align="center">

<h1>🐷 PIG BANK 🐷</h1>

<h3 style="margin-top: -10px; font-weight: normal;">
CARD MICROSERVICE
</h3>

<br/>

<img src="https://img.shields.io/badge/AWS-%23232F3E.svg?style=for-the-badge&logo=amazon-aws&logoColor=white"/>
<img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/terraform-%235835CC.svg?style=for-the-badge&logo=terraform&logoColor=white"/>

</div>

## 🎯 Overview

**Pig Bank Card Microservice** is a core component of the Pig Bank ecosystem, designed to handle the lifecycle 
of financial cards. Built with **Clean Architecture** (Hexagonal) principles, it ensures high scalability and 
decoupling between business logic and cloud infrastructure. It processes card requests, manages credit/debit 
states, and integrates with notification systems.

## ✨ Key Features

### 🛠️ Card Orchestration
- **Dynamic Request Processing**: Handles incoming card requests through AWS Lambda and API Gateway.
- **Automated Validation**: Implements domain logic to calculate limits and validate user eligibility.

### ☁️ Cloud-Native Integration
- **Serverless Compute**: Fully powered by AWS Lambda for cost-efficient scaling.
- **NoSQL Persistence**: Leverages Amazon DynamoDB for ultra-low latency data storage.
- **Event-Driven Messaging**: Integrated with AWS SQS for asynchronous notification dispatching.

### 🏗️ Enterprise-Grade Architecture
- **Hexagonal Layers**: Strict separation between `Domain` (Core logic), `App` (Use cases), and `Infra` (External Adapters).
- **Port & Adapter Pattern**: Facilitates swapping infrastructure (e.g., changing databases) without affecting business rules.

## 🏗️ Project Structure

The microservice follows a strict Clean Architecture layout:

```text
src/
├── app/
│   └── services/            # Use Cases (Business workflows)
├── domain/
│   ├── entities/            # Core Domain Models (Card, Transaction)
│   ├── interfaces/          # Ports (Repository & Service contracts)
│   │   ├── query/           # Read operations
│   │   └── statement/       # Write operations (Command side)
│   ├── models/              # DTOs and Data Models
│   └── types/               # Custom types and Enums (CardType)
└── infra/
    ├── adapters/            # Infrastructure implementations (DynamoDB, SQS)
    └── handlers/            # Entry points (AWS Lambda handlers)
```

## 🚀 Getting Started

### Prerequisites

<ul>

<li><strong>Node.js</strong> 20+</li>
<li><strong>AWS CLI</strong> configured with appropriate permissions.</li>
<li><strong>Terraform</strong v1.5.0+ for infrastructure provisioning.></li>

</ul>

### 🛠️ Installation & Setup

<ol>

<li>

<strong>Clone the repository</strong>

```bash
git clone [https://github.com/MaySalguedo/PIG_BANK_CARD_MICROSERVICE.git](https://github.com/MaySalguedo/PIG_BANK_CARD_MICROSERVICE.git)
cd PIG_BANK_CARD_MICROSERVICE
npm install
```

</li>

<li>

<strong>Compile the project</strong>

```bash
# Compiles TypeScript and resolves Path Aliases (@services, @adapters, etc.)
npm run build
```

</li>

<li>

<strong>Deploy Infrastructure</strong>

```bash
tar -a -c -f lambda.zip dist package.json
terraform apply
```

</li>

</ol>

## 🛠️ Tech Stack

<ol>

<li><strong>Runtime:</strong> Node.js with TypeScript for type-safe development.</li>
<li><strong>Bundler:</strong> esbuild for high-performance Lambda packaging.</li>
<li><strong>Database:</strong> Amazon DynamoDB (Single Table Design).</li>
<li><strong>Messaging:</strong> AWS SQS (Simple Queue Service) for cross-service communication.</li>

</ol>

## Environment Configuration

```env
# AWS Configuration
AWS_SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/your-account/notification-queue
```

## 📡 API Endpoints

<ol>

<li>

<h3>🃏 Create Card Request</h3>

<strong>POST</strong> <code>/card/request</code>

Creates a card request (debit or credit).

<p><strong>Request Body:</strong></p>

```json
{
  "userId": "uuid",
  "request": "DEBIT | CREDIT"
}
```

<p><strong>Response:</strong></p>

```json
{
  "cardId": "uuid",
  "status": "PENDING",
  "type": "DEBIT | CREDIT",
  "message": "Card request created successfully"
}
```

</li>

<li>

<h3>🃏 Activate Card</h3>

<strong>POST</strong> <code>/card/activate</code>

Activates a card based on business rules (e.g., transaction count).

<p><strong>Request Body:</strong></p>

```json
{
  "userId": "uuid",
  "transactionCount": 12
}
```

<p><strong>Response:</strong></p>

```json
{
  "cardId": "uuid",
  "status": "ACTIVE",
  "message": "Card activated successfully"
}
```

</li>

<li>

<h3>💳 Purchase</h3>

<strong>POST</strong> <code>/transactions/purchase</code>

Performs a purchase using the card.

<p><strong>Request Body:</strong></p>

```json
{
  "cardId": "uuid",
  "merchant": "string",
  "amount": number
}
```

<p><strong>Response:</strong></p>

```json
{
  "transactionId": "uuid",
  "status": "APPROVED",
  "amount": number,
  "merchant": "string",
  "remainingBalance": number
}
```

</li>

<li>

<h3>💳 Pay Card</h3>

<strong>POST</strong> <code>/card/paid/{cardId}</code>

Pays a card balance.

<p><strong>Path Params:</strong></p>

<ul>
<li><code>cardId</code>: Card UUID</li>
</ul>

<p><strong>Request Body:</strong></p>

```json
{
  "amount": number
}
```

<p><strong>Response:</strong></p>

```json
{
  "cardId": "uuid",
  "paidAmount": number,
  "remainingDebt": number,
  "message": "Payment applied successfully"
}
```

</li>

<li>

<h3>💰 Save Money (Piggy Bank)</h3>

<strong>POST</strong> <code>/transactions/save/{cardId}</code>

Saves money into the piggy bank.

<p><strong>Path Params:</strong></p>

<ul>
<li><code>cardId</code>: Card UUID</li>
</ul>

<p><strong>Request Body:</strong></p>

```json
{
  "merchant": "string",
  "amount": number
}
```

<p><strong>Response:</strong></p>

```json
{
  "transactionId": "uuid",
  "type": "SAVE",
  "amount": number,
  "newSavingsBalance": number,
  "message": "Amount saved successfully"
}
```

</li>

</ol>