const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");
const archiver = require("archiver");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
  const { services, config } = req.body;

  const projectPath = path.join(__dirname, "output");
  await fs.emptyDir(projectPath);

  /* -------- Copy Templates -------- */

  if (services.backend) {
    await fs.copy(
      path.join(__dirname, "templates/backend"),
      path.join(projectPath, "backend")
    );
  }

  if (services.frontend) {
    await fs.copy(
      path.join(__dirname, "templates/frontend"),
      path.join(projectPath, "frontend")
    );
  }

  /* -------- Docker Compose -------- */

  let compose = `
version: '3.9'
services:
`;

  if (services.backend) {
    compose += `
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      ${services.postgres ? "- postgres" : ""}
      ${services.redis ? "- redis" : ""}
    env_file:
      - .env
`;
  }

  if (services.frontend) {
    compose += `
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
`;
  }

  if (services.postgres) {
    compose += `
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${config.dbName}
      POSTGRES_USER: ${config.dbUser}
      POSTGRES_PASSWORD: ${config.dbPassword}
`;

    if (config.enableVolume) {
      compose += `
    volumes:
      - postgres_data:/var/lib/postgresql/data
`;
    }
  }

  if (services.redis) {
    compose += `
  redis:
    image: redis:7
    ports:
      - "6379:6379"
`;
  }

  if (services.postgres && config.enableVolume) {
    compose += `
volumes:
  postgres_data:
`;
  }

  await fs.writeFile(
    path.join(projectPath, "docker-compose.yml"),
    compose
  );

  /* -------- .env -------- */

  const envFile = `
POSTGRES_DB=${config.dbName}
POSTGRES_USER=${config.dbUser}
POSTGRES_PASSWORD=${config.dbPassword}
`;

  await fs.writeFile(path.join(projectPath, ".env"), envFile);

  /* -------- Kubernetes YAML -------- */

  if (services.kubernetes) {
    const k8sPath = path.join(projectPath, "k8s");
    await fs.ensureDir(k8sPath);

    if (services.backend) {
      const backendYaml = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: backend:latest
          ports:
            - containerPort: 5000
---
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  type: NodePort
  selector:
    app: backend
  ports:
    - port: 5000
      targetPort: 5000
      nodePort: 30007
`;
      await fs.writeFile(
        path.join(k8sPath, "backend.yaml"),
        backendYaml
      );
    }

    if (services.postgres) {
      const postgresYaml = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15
          env:
            - name: POSTGRES_DB
              value: "${config.dbName}"
            - name: POSTGRES_USER
              value: "${config.dbUser}"
            - name: POSTGRES_PASSWORD
              value: "${config.dbPassword}"
          ports:
            - containerPort: 5432
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
`;
      await fs.writeFile(
        path.join(k8sPath, "postgres.yaml"),
        postgresYaml
      );
    }

    if (services.redis) {
      const redisYaml = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:7
          ports:
            - containerPort: 6379
---
apiVersion: v1
kind: Service
metadata:
  name: redis
spec:
  selector:
    app: redis
  ports:
    - port: 6379
`;
      await fs.writeFile(
        path.join(k8sPath, "redis.yaml"),
        redisYaml
      );
    }
  }

  /* -------- Zip -------- */

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=stack.zip"
  );

  const archive = archiver("zip");
  archive.pipe(res);
  archive.directory(projectPath, false);
  archive.finalize();
});

app.listen(5000, () =>
  console.log("Stack Builder API running on 5000")
);