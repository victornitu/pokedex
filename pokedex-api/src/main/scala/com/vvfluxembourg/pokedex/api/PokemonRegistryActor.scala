package com.vvfluxembourg.pokedex.api

import akka.actor.{ Actor, ActorLogging, Props }
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.{ HttpMethods, HttpRequest, HttpResponse, StatusCodes }
import akka.http.scaladsl.unmarshalling.Unmarshal
import akka.stream.scaladsl.Source
import akka.stream.{ ActorMaterializer, ActorMaterializerSettings, OverflowStrategy }
import com.redis.RedisClientPool
import spray.json.RootJsonFormat

import scala.util.{ Failure, Success }
import scala.concurrent.Future

final case class PokemonReference(name: String, url: String)
final case class PokemonTypeReference(id: Int, name: String, pokemon: List[PokemonReference])

final case class Pokemon(id: Int, name: String, avatar: String = "", types: List[String], stats: Map[String, PokemonStat] = Map.empty[String, PokemonStat], likes: Int = 0)
final case class PokemonStat(effort: Int, baseStat: Int)
final case class PokemonType(id: Int, name: String, stats: Map[String, PokemonStat])

object PokeUtils {
  def mapify(pokemon: Pokemon): Map[String, String] = {
    Map(
      "id" -> pokemon.id.toString,
      "name" -> pokemon.name,
      "avatar" -> pokemon.avatar,
      "likes" -> pokemon.likes.toString,
      "types" -> pokemon.types.mkString(";")
    ) ++ mapify(pokemon.stats)
  }

  def parsePokemon(cache: Map[String, String]): Option[Pokemon] = for {
    id <- cache.get("id")
    name <- cache.get("name")
    avatar <- cache.get("avatar")
    likes <- cache.get("likes")
    types <- cache.get("types")
    stats <- parseStats(cache)
  } yield {
    Pokemon(id.toInt, name, avatar, types.split(";").toList, stats, likes.toInt)
  }

  def mapify(pokemonType: PokemonType): Map[String, String] = {
    Map(
      "id" -> pokemonType.id.toString,
      "name" -> pokemonType.name
    ) ++ mapify(pokemonType.stats)
  }

  def parsePokemonType(cache: Map[String, String]): Option[PokemonType] = for {
    id <- cache.get("id")
    name <- cache.get("name")
    stats <- parseStats(cache)
  } yield {
    PokemonType(id.toInt, name, stats)
  }

  private def mapify(stats: Map[String, PokemonStat]): Map[String, String] = {
    val statKeys = stats.keySet
    Map(
      "stats" -> statKeys.mkString(";")
    ) ++ statKeys.flatMap { s =>
        Set(
          s"$s:effort" -> stats(s).effort.toString,
          s"$s:baseStat" -> stats(s).baseStat.toString
        )
      }
  }

  private def parseStats(cache: Map[String, String]): Option[Map[String, PokemonStat]] = for {
    statKeys <- cache.get("stats")
  } yield {
    statKeys.split(";").foldLeft(Map.empty[String, PokemonStat]) { (acc, k) =>
      (cache.get(s"$k:effort"), cache.get(s"$k:baseStat")) match {
        case (Some(effort), Some(baseStat)) => acc + (k -> PokemonStat(effort.toInt, baseStat.toInt))
        case _ => acc
      }
    }
  }
}

object PokemonRegistryActor {

  final case class ActionPerformed(description: String)

  final case class GetPokemon(name: String)

  final case class LikePokemon(name: String)

  final case class GetPokemonType(name: String)

  def props: Props = Props[PokemonRegistryActor]
}

class PokemonRegistryActor extends Actor with ActorLogging with JsonSupport {

  import akka.pattern.pipe
  import context.dispatcher
  import PokemonRegistryActor._

  private final val apiHost = "pokeapi" // "pokeapi.co"
  private final val apiPort = 8000
  private final val apiUrl = s"http://$apiHost:$apiPort/api/v2"

  private final val redis = ("cache", 6379) // "localhost", 6379

  final implicit val materializer: ActorMaterializer = ActorMaterializer(ActorMaterializerSettings(context.system))

  private val http = Http(context.system)

  private lazy val clients = new RedisClientPool(redis._1, redis._2)
  private lazy val httpFlow = http.cachedHostConnectionPool[PokemonReference](apiHost, apiPort)
  // private lazy val httpFlow = http.cachedHostConnectionPoolHttps[PokemonReference](host)

  def receive: Receive = {
    case GetPokemon(name) =>
      getPokemon(name) pipeTo sender()
    case LikePokemon(name) =>
      likePokemon(name) pipeTo sender()
    case GetPokemonType(name) =>
      getPokemonType(name) pipeTo sender()
  }

  private def key(name: String): String = s"pokemon:${name.toLowerCase}"

  private def getPokemon(name: String): Future[Option[Pokemon]] = {
    clients.withClient {
      client =>
        client.hgetall1(key(name)).flatMap(PokeUtils.parsePokemon) match {
          case None =>
            load[Pokemon](s"$apiUrl/pokemon/$name/").map {
              case None => None
              case Some(pokemon) =>
                log.info(s"Cache pokemon ${pokemon.name}")
                client.hmset(key(pokemon.name), PokeUtils.mapify(pokemon))
                Some(pokemon)
            }
          case Some(pokemon) =>
            log.info(s"Get pokemon $name from cache")
            Future.successful(Some(pokemon))
        }
    }
  }

  private def likePokemon(name: String): Future[ActionPerformed] = {
    clients.withClient {
      client =>
        {
          client.hincrby(key(name), "likes", 1)
          Future.successful(ActionPerformed(s"Pokemon $name liked."))
        }
    }
  }

  private def getPokemonType(name: String): Future[Option[PokemonType]] = {
    clients.withClient {
      client =>
        client.hgetall1(key(name)).flatMap(PokeUtils.parsePokemonType) match {
          case None =>
            load[PokemonTypeReference](s"$apiUrl/type/$name/").flatMap {
              case None => Future.successful(None)
              case Some(typeRef) => for {
                pokemons <- load(typeRef.pokemon)
              } yield {
                val stats = pokemons.map(_.stats).foldLeft(Map.empty[String, List[PokemonStat]]) {
                  (acc, stat) =>
                    stat.keys.foldLeft(acc) {
                      (a, key) =>
                        a.get(key) match {
                          case Some(list) => a + (key -> (stat(key) :: list))
                          case None => a + (key -> List(stat(key)))
                        }
                    }
                }.mapValues { values =>
                  val sums = values.reduceLeft {
                    (s1, s2) => PokemonStat(s1.effort + s2.effort, s1.baseStat + s2.baseStat)
                  }
                  PokemonStat(sums.effort / values.length, sums.baseStat / values.length)
                }
                val pokemonType = PokemonType(
                  typeRef.id,
                  typeRef.name,
                  stats
                )
                log.info(s"Cache pokemon type $name")
                client.hmset(key(name), PokeUtils.mapify(pokemonType))
                Some(pokemonType)
              }
            }
          case Some(pokemonType) =>
            log.info(s"Get pokemon type $name from cache")
            Future.successful(Some(pokemonType))
        }
    }
  }

  private def load[T](url: String)(implicit format: RootJsonFormat[T]): Future[Option[T]] = {
    log.info(s"load $url")
    http.singleRequest(HttpRequest(uri = url)) flatMap {
      case HttpResponse(StatusCodes.OK, _, entity, _) =>
        Unmarshal(entity).to[T].map { e =>
          log.info(s"Request to $url: $e")
          Some(e)
        }
      case resp @ HttpResponse(StatusCodes.NotFound, _, _, _) =>
        log.info(s"Request to $url: not found")
        resp.discardEntityBytes()
        Future(None)
      case resp @ HttpResponse(code, _, _, _) =>
        log.info(s"Request to $url: status code $code")
        resp.discardEntityBytes()
        Future(None)
    }
  }

  private def load(pokemons: List[PokemonReference]): Future[List[Pokemon]] = {
    log.info(s"load ${pokemons.length} pokemons")
    clients.withClient {
      client =>
        {
          val (cache, refs) = pokemons.foldLeft((List.empty[Pokemon], List.empty[PokemonReference])) { (acc, ref) =>
            client.hgetall1(key(ref.name)).flatMap(PokeUtils.parsePokemon) match {
              case None => (acc._1, ref :: acc._2)
              case Some(pokemon) => (pokemon :: acc._1, acc._2)
            }
          }
          val results = Source(refs)
            .map(p => (HttpRequest(HttpMethods.GET, p.url), p))
            .via(httpFlow)
            .buffer(10, OverflowStrategy.backpressure)
            .runFold(Future.successful(List.empty[Pokemon])) {
              case (acc, (Failure(t), pokemonRef)) =>
                log.info(s"Failed to load pokemon ${pokemonRef.name}: ${t.getMessage}")
                acc
              case (acc, (Success(HttpResponse(StatusCodes.OK, _, entity, _)), _)) =>
                acc.flatMap(a => Unmarshal(entity).to[Pokemon].map(p => {
                  log.info(s"Successfully load pokemon $p")
                  log.info(s"Cache pokemon ${p.name}")
                  client.hmset(key(p.name), PokeUtils.mapify(p))
                  p :: a
                }))
            }
          results.flatten.map(_ ++ cache)
        }
    }
  }
}
