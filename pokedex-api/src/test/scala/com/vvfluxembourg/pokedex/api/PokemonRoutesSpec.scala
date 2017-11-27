package com.vvfluxembourg.pokedex.api

import akka.actor.ActorRef
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.testkit.ScalatestRouteTest
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{ Matchers, WordSpec }

class PokemonRoutesSpec extends WordSpec with Matchers with ScalaFutures with ScalatestRouteTest
    with PokemonRoutes {

  override val pokemonRegistryActor: ActorRef =
    system.actorOf(PokemonRegistryActor.props, "pokemonRegistry")

  lazy val routes: Route = pokemonRoutes

  "PokemonRoutes" should {

  }
}
