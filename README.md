# 🚀 Stack Builder

Stack Builder is a developer tool that helps generate **Docker Compose** and **Kubernetes YAML configuration files** automatically based on selected technologies.

Users can select services like **Node.js backend, React frontend, PostgreSQL, and Redis**, and the application will generate the required infrastructure configuration with a **live preview**.

This tool simplifies the process of setting up containerized full-stack applications.

---

## ✨ Features

* 🔧 Select services for your stack
* 🐳 Generate **Docker Compose** configuration
* ☸ Generate **Kubernetes YAML** files
* 🗄 PostgreSQL configuration support
* ⚡ Redis integration
* 📄 Live preview of generated configuration
* 💾 Optional persistent volume support
* 🎯 Simple and developer-friendly UI

---

## 🛠 Tech Stack

### Frontend

* React
* Tailwind CSS

### Backend

* Node.js
* Express.js

### DevOps

* Docker
* Docker Compose
* Kubernetes

---

## 📂 Project Structure

```
stack-builder
│
├── client            # React frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── server            # Node.js backend
│   ├── routes
│   ├── controllers
│   └── index.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

### 1️⃣ Clone the repository

```
git clone https://github.com/keshav642/stack-builder.git
```

---

### 2️⃣ Go to project folder

```
cd stack-builder
```

---

### 3️⃣ Install dependencies

Frontend

```
cd client
npm install
```

Backend

```
cd ../server
npm install
```

---

### 4️⃣ Run the project

Start backend

```
cd server
npm start
```

Start frontend

```
cd client
npm start
```

---

## 📌 Use Case

This tool helps developers quickly generate infrastructure configuration files for containerized applications without writing YAML manually.

It is especially useful for:

* DevOps engineers
* Full-stack developers
* Microservices projects
* Kubernetes beginners

---

## 👨‍💻 Author

**Keshav**

GitHub:
https://github.com/keshav642

---

## ⭐ Support

If you find this project helpful, consider giving it a ⭐ on GitHub!
