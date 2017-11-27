package com.vvfluxembourg.pokedex.api

import akka.actor.{ ActorRef, ActorSystem }
import akka.http.scaladsl.Http
import akka.http.scaladsl.Http.ServerBinding
import akka.http.scaladsl.server.Route
import akka.stream.ActorMaterializer

import scala.concurrent.{ ExecutionContext, Future }

object ApiServer extends App with PokemonRoutes {

  implicit val system: ActorSystem = ActorSystem("pokedexApiServer")
  implicit val materializer: ActorMaterializer = ActorMaterializer()

  implicit val executionContext: ExecutionContext = system.dispatcher

  val pokemonRegistryActor: ActorRef = system.actorOf(PokemonRegistryActor.props, "pokemonRegistryActor")

  lazy val routes: Route = pokemonRoutes

  val host = "0.0.0.0"
  val port = 8080

  val serverBindingFuture: Future[ServerBinding] = Http().bindAndHandle(routes, host, port)

  println(s"Server online at http://$host:$port/")
}
