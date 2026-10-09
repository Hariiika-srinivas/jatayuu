FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
COPY --from=frontend-builder /app/dist ./dist

ENV PORT=3000
EXPOSE 3000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "3000"]
