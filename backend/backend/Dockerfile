FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY target/*.jar app.jar

RUN mkdir -p /app/uploads

ENV TZ=Asia/Seoul
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
