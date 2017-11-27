package com.vvfluxembourg.pokedex.api

import akka.actor.{ ActorRef, ActorSystem }
import akka.event.Logging

import scala.concurrent.duration._
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.directives.MethodDirectives.get
import akka.http.scaladsl.server.directives.MethodDirectives.patch
import akka.http.scaladsl.server.directives.RouteDirectives.complete
import akka.http.scaladsl.server.directives.PathDirectives.path

import scala.concurrent.Future
import com.vvfluxembourg.pokedex.api.PokemonRegistryActor._
import akka.pattern.ask
import akka.util.Timeout

trait PokemonRoutes extends JsonSupport {
  implicit def system: ActorSystem

  lazy val log = Logging(system, classOf[PokemonRoutes])

  def pokemonRegistryActor: ActorRef

  implicit lazy val timeout: Timeout = Timeout(10.seconds)

  lazy val pokemonRoutes: Route =
    pathPrefix("pokemon" / Segment) { name =>
      pathEnd {
        get {
          val pokemon: Future[Option[Pokemon]] =
            (pokemonRegistryActor ? GetPokemon(name)).mapTo[Option[Pokemon]]
          rejectEmptyResponse {
            complete(pokemon)
          }
        }
      } ~
        path("like") {
          patch {
            val action: Future[ActionPerformed] =
              (pokemonRegistryActor ? LikePokemon(name)).mapTo[ActionPerformed]
            onSuccess(action) { performed =>
              log.info("Liked pokemon [{}]: {}", name, performed.description)
              complete((StatusCodes.OK, performed))
            }
          }
        }
    } ~ pathPrefix("type" / Segment) { name =>
      pathEnd {
        get {
          val pokemonType: Future[Option[PokemonType]] =
            (pokemonRegistryActor ? GetPokemonType(name)).mapTo[Option[PokemonType]]
          rejectEmptyResponse {
            complete(pokemonType)
          }
        }
      }
    }
}
