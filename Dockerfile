# 1. Build React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# 2. Build Spring Boot jar with the built frontend assets
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /workspace
COPY backend/pom.xml ./backend/pom.xml
COPY backend/src ./backend/src
COPY --from=frontend-build /frontend/dist ./backend/src/main/resources/static/
RUN mvn -f backend/pom.xml clean package -DskipTests

# 3. Final runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-build /workspace/backend/target/*.jar app.jar
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "/app/app.jar"]