package com.vvfluxembourg.pokedex.api

import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import com.vvfluxembourg.pokedex.api.PokemonRegistryActor.ActionPerformed
import spray.json.{DefaultJsonProtocol, RootJsonFormat}

trait JsonSupport extends SprayJsonSupport {

  import DefaultJsonProtocol._

  implicit val pokemonJsonFormat: RootJsonFormat[Pokemon] = jsonFormat3(Pokemon)

  implicit val actionPerformedJsonFormat: RootJsonFormat[ActionPerformed] = jsonFormat1(ActionPerformed)
}
