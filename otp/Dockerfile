FROM eclipse-temurin:21-jre

WORKDIR /otp

COPY otp-shaded-2.8.1.jar .
COPY graph.obj .
COPY otp-config.json .
COPY router-config.json .
COPY build-config.json .

EXPOSE 8080

CMD ["java", "-Xmx2g", "-jar", "otp-shaded-2.8.1.jar", "--load", "--serve", "/otp"]