
# Google RCS Server

This document provides a comprehensive guide to setting up, running, and deploying the Google RCS server application.

## 1. Project Overview

This server acts as a bridge between your AI Studio application and the Google RCS Business Messaging (RBM) platform. It provides a simple API to send and receive messages using the RBM API.

## 2. Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* [Node.js and npm](https://nodejs.org/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/google-rcs-server.git
   ```

2. **Install the dependencies:**

   ```bash
   npm install
   ```

3. **Run the server:**

   ```bash
   node index.js
   ```

The server will be running on `http://localhost:3000`.

## 3. Connecting with AI Studio

To connect your AI Studio application to this server, you will need to make HTTP requests to the following endpoints:

* **`POST /api/connect`**: This endpoint establishes a connection with the server.
* **`POST /api/send-message`**: This endpoint sends a message to a user. The request body should be a JSON object with the following properties:
  * `msisdn`: The user's phone number in E.164 format (e.g., `+12223334444`).
  * `message`: The message you want to send.

## 4. Google RCS RBM API Integration

To integrate with the Google RCS RBM API, you will need to create a service account and download the credentials as a JSON file.

1. **Create a service account:** Follow the instructions in the [Google Cloud documentation](https://cloud.google.com/iam/docs/creating-managing-service-accounts) to create a service account.
2. **Enable the RCS Business Messaging API:** In the Google Cloud Console, enable the **RCS Business Messaging API** for your project.
3. **Download the credentials:** Download the service account credentials as a JSON file and save it as `credentials.json` in the root of the project.

## 5. Deployment to AWS

These instructions will help you deploy the application to an AWS EC2 instance.

1. **Create an AWS Account:** If you don't already have one, you will need to create an AWS account.
2. **Create an EC2 Instance:** This will be your virtual server in the cloud.
3. **Install Node.js and npm:** You will need to install Node.js and npm on your EC2 instance.
4. **Upload your application:** You can use a tool like `scp` or `rsync` to upload your application to the EC2 instance.
5. **Install dependencies:** Once you have uploaded your application, you will need to install the dependencies by running `npm install`.
6. **Start the server:** You can start the server by running `node index.js`.
7. **Configure a process manager:** To ensure that your server runs continuously, you should use a process manager like `pm2`.
8. **Configure a web server:** You can use a web server like Nginx or Apache to act as a reverse proxy for your Node.js application. This will allow you to use a custom domain name and handle SSL certificates.

## 6. Downloadable Version

To create a downloadable version of the application, you can simply zip the entire `Google-RCS-server` directory. This will create a single file that you can easily download and share.

## 7. GUI

The application includes a simple GUI that displays the API endpoints and other information. You can access it by opening `http://localhost:3000` in your browser.
