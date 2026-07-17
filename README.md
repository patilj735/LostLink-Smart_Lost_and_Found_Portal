# 🔍 LostLink – Smart Lost and Found Portal

LostLink is a smart cloud-based Lost and Found Portal designed to simplify the process of reporting, searching, and managing lost and found items.

The platform provides a centralized system where users can report lost or found items and search for potential matches efficiently.

---

## 📸 Screenshots

### 🌐 LostLink Web Interface
![LostLink Web Interface](https://github.com/user-attachments/assets/89719db8-be28-4b2f-a881-014645b8b32e)
![LostLink Web Interface](https://github.com/user-attachments/assets/a1658ada-f35a-4ec1-bf53-fcf156babb89)

### 🔍 Item Search and Reporting
![LostLink Item Search](https://github.com/user-attachments/assets/f927b130-fac8-416b-9354-b2493efd945b)
![LostLink Item Search](https://github.com/user-attachments/assets/b6045f3a-7ec0-4624-a601-d1565db4a5eb)
![LostLink Item Search](https://github.com/user-attachments/assets/3073888d-7c98-4f45-a2e8-ab1342a1c6b7)

---

## 🚀 Features

* Report lost and found items
* Search and browse reported items
* Centralized cloud-based data storage
* Responsive and user-friendly interface
* Scalable serverless backend architecture

## ☁️ AWS Services Used

* **Amazon S3** – Stores static website assets and uploaded files
* **AWS Lambda** – Executes backend business logic without managing servers
* **Amazon API Gateway** – Exposes REST APIs for frontend communication
* **Amazon DynamoDB** – Stores lost and found item records
* **AWS IAM** – Manages secure permissions and access between AWS services

## 🛠️ Technologies Used

* HTML5
* CSS3
* JavaScript
* AWS Lambda
* Amazon API Gateway
* Amazon DynamoDB
* Amazon S3
* AWS IAM

## 🏗️ System Architecture

```mermaid
flowchart LR
    User[👤 User]

    subgraph Frontend["🌐 Frontend"]
        UI[LostLink Web Interface]
    end

    subgraph AWS["☁️ AWS Cloud"]
        S3[Amazon S3]
        API[API Gateway]
        Lambda[AWS Lambda]
        DB[(DynamoDB)]
        IAM[IAM Roles & Policies]
    end

    User --> UI
    UI -->|HTTP Requests| API
    UI -->|Static Assets| S3
    API --> Lambda
    Lambda --> DB
    Lambda --> S3
    IAM -.-> Lambda
    IAM -.-> S3
    IAM -.-> DB
```

## 🔄 Application Workflow

```text
User
  │
  ▼
LostLink Web Interface
  │
  ▼
Amazon API Gateway
  │
  ▼
AWS Lambda
  │
  ├──────────────► Amazon DynamoDB
  │                └── Lost & Found Item Data
  │
  └──────────────► Amazon S3
                   └── Uploaded Files / Assets
```

## 📁 Project Structure

```text
LostLink-Smart_Lost_and_Found_Portal/
│
├── index.html
├── style.css
├── script.js
│
└── README.md
```

## 🎯 Objective

The goal of LostLink is to provide a simple, efficient, and scalable platform that helps people reconnect with their lost belongings through a centralized cloud-based system.

## 👨‍💻 Author

**Janhavi Patil**
