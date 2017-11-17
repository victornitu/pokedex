package com.vvfluxembourg.pokedex.api

import akka.actor.ActorRef
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.testkit.ScalatestRouteTest
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{Matchers, WordSpec}

class PokemonRoutesSpec extends WordSpec with Matchers with ScalaFutures with ScalatestRouteTest
  with PokemonRoutes {

  override val pokemonRegistryActor: ActorRef =
    system.actorOf(PokemonRegistryActor.props, "pokemonRegistry")

  lazy val routes: Route = pokemonRoutes

  "PokemonRoutes" should {
    "returns Pikachu (GET /pokemon/pikachu)" in {
      val request = HttpRequest(uri = "/pokemon/pikachu")

      request ~> routes ~> check {
        status should ===(StatusCodes.OK)

        contentType should ===(ContentTypes.`application/json`)

        entityAs[String] should ===("""{"name":"Pikachu","likes":0,"dislikes":0}""")
      }
    }

    "be able to like Pikachu (PATCH /pokemon/pikachu/like)" in {

      val request = Patch("/pokemon/pikachu/like")

      request ~> routes ~> check {
        status should ===(StatusCodes.OK)

        contentType should ===(ContentTypes.`application/json`)

        entityAs[String] should ===("""{"description":"Pokemon pikachu liked."}""")
      }
    }

    "returns Pikachu with one like (GET /pokemon/pikachu)" in {
      val request = HttpRequest(uri = "/pokemon/pikachu")

      request ~> routes ~> check {
        status should ===(StatusCodes.OK)

        contentType should ===(ContentTypes.`application/json`)

        entityAs[String] should ===("""{"name":"Pikachu","likes":1,"dislikes":0}""")
      }
    }
  }
}
