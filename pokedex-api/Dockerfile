FROM openjdk:8

ENV SBT_VERSION 1.0.2

RUN \
  curl -L -o sbt-${SBT_VERSION}.deb http://dl.bintray.com/sbt/debian/sbt-${SBT_VERSION}.deb && \
  dpkg -i sbt-${SBT_VERSION}.deb && \
  rm sbt-${SBT_VERSION}.deb && \
  apt-get update && \
  apt-get install sbt && \
  sbt sbtVersion

WORKDIR /app

ADD . /app

RUN sbt update

RUN sbt compile

CMD sbt run

EXPOSE 8080
