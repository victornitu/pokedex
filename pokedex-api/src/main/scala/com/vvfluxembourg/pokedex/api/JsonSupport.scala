package com.vvfluxembourg.pokedex.api

import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import com.vvfluxembourg.pokedex.api.PokemonRegistryActor.ActionPerformed

trait JsonSupport extends SprayJsonSupport {

  import spray.json._
  import DefaultJsonProtocol._

  implicit val pokemonStatJsonFormat: RootJsonFormat[PokemonStat] = jsonFormat2(PokemonStat)

  implicit object PokemonTypeReferenceJsonFormat extends RootJsonFormat[PokemonTypeReference] {
    override def write(t: PokemonTypeReference) = JsObject(
      "id" -> JsNumber(t.id),
      "name" -> JsString(t.name),
      "pokemon" -> JsArray(t.pokemon.map {
        p =>
          JsObject(
            "name" -> JsString(p.name),
            "url" -> JsString(p.url)
          )
      }.toVector)
    )
    override def read(json: JsValue): PokemonTypeReference = {
      json.asJsObject.getFields("id", "name", "pokemon") match {
        case Seq(JsNumber(id), JsString(name), JsArray(pokemons)) =>
          PokemonTypeReference(id.toInt, name, pokemons.map(_.asJsObject.getFields("pokemon") match {
            case Seq(pokemon) =>
              pokemon.asJsObject.getFields("name", "url") match {
                case Seq(JsString(n), JsString(u)) => PokemonReference(name = n, url = u)
                case _ => throw DeserializationException("Pokemon expected")
              }
            case _ => throw DeserializationException("Pokemon expected")
          }).toList)
        case _ => throw DeserializationException("Pokemon type expected")
      }
    }
  }

  implicit object PokemonJsonFormat extends RootJsonFormat[Pokemon] {
    override def write(p: Pokemon) = JsObject(
      "id" -> JsNumber(p.id),
      "name" -> JsString(p.name),
      "avatar" -> JsString(p.avatar),
      "types" -> p.types.toJson,
      "stats" -> p.stats.toJson,
      "likes" -> JsNumber(p.likes)
    )
    override def read(json: JsValue): Pokemon = {
      json.asJsObject.getFields("id", "name", "stats", "types", "sprites") match {
        case Seq(JsNumber(id), JsString(name), JsArray(stats), JsArray(types), sprites) =>
          Pokemon(
            id = id.toInt,
            name = name,
            avatar = sprites.asJsObject.getFields("front_default") match {
              case Seq(JsString(avatar)) => avatar
              case _ => throw DeserializationException("Avatar url expected")
            },
            types = types.foldLeft(List.empty[String]) {
              (acc, currentType) =>
                currentType.asJsObject.getFields("type") match {
                  case Seq(typeRef) => typeRef.asJsObject.getFields("name") match {
                    case Seq(JsString(typeName)) => typeName :: acc
                    case _ => throw DeserializationException("Type name expected")
                  }
                  case _ => throw DeserializationException("Type reference expected")
                }
            },
            stats = stats.foldLeft(Map.empty[String, PokemonStat]) {
              (acc, currentStat) =>
                currentStat.asJsObject.getFields("stat", "effort", "base_stat") match {
                  case Seq(stat, JsNumber(effort), JsNumber(baseStat)) =>
                    stat.asJsObject.getFields("name") match {
                      case Seq(JsString(statName)) => acc + (statName -> PokemonStat(effort.toInt, baseStat.toInt))
                      case _ => throw DeserializationException("Stat name expected")
                    }
                  case _ => throw DeserializationException("Stat expected")
                }
            }
          )
        case _ => throw DeserializationException("Pokemon expected")
      }
    }
  }

  implicit val pokemonTypeFormat: RootJsonFormat[PokemonType] = jsonFormat3(PokemonType)

  implicit val actionPerformedJsonFormat: RootJsonFormat[ActionPerformed] = jsonFormat1(ActionPerformed)
}
