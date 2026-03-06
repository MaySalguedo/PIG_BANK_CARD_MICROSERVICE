# Pig Bank: Card Microservice 🐷💳

![AWS](https://img.shields.io/badge/AWS-%23232F3E.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Terraform](https://img.shields.io/badge/terraform-%235835CC.svg?style=for-the-badge&logo=terraform&logoColor=white)

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

<ol>

## 🛠️ Tech Stack

<ol>

<li><strong>Runtime:</strong> Node.js with TypeScript for type-safe development.</li>
<li><strong>Bundler:</strong> `esbuild` for high-performance Lambda packaging.</li>
<li><strong>Database:</strong> Amazon DynamoDB (Single Table Design).</li>
<li><strong>Messaging:</strong> AWS SQS (Simple Queue Service) for cross-service communication.</li>

</ol>

## Environment Configuration

```text
# AWS Configuration
AWS_SQS_QUEUE_URL=[https://sqs.us-east-1.amazonaws.com/your-account/notification-queue](https://sqs.us-east-1.amazonaws.com/your-account/notification-queue)
```