lazy val akkaHttpVersion  = "10.0.10"
lazy val akkaVersion      = "2.5.4"

lazy val root = (project in file(".")).
  settings(
    inThisBuild(List(
      organization    := "com.vvfluxembourg",
      scalaVersion    := "2.12.3"
    )),
    name := "pokedex-api",
    libraryDependencies ++= Seq(
      "com.typesafe.akka" %% "akka-http"            % akkaHttpVersion,
      "com.typesafe.akka" %% "akka-http-spray-json" % akkaHttpVersion,
      "com.typesafe.akka" %% "akka-http-xml"        % akkaHttpVersion,
      "com.typesafe.akka" %% "akka-stream"          % akkaVersion,
      "net.debasishg"     %% "redisclient"          % "3.4",

      "com.typesafe.akka" %% "akka-http-testkit"    % akkaHttpVersion % Test,
      "com.typesafe.akka" %% "akka-testkit"         % akkaVersion     % Test,
      "com.typesafe.akka" %% "akka-stream-testkit"  % akkaVersion     % Test,
      "org.scalatest"     %% "scalatest"            % "3.0.1"         % Test
    )
  )
