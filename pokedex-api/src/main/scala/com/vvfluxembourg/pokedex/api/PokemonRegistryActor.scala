package com.vvfluxembourg.pokedex.api

import akka.actor.{Actor, ActorLogging, Props}

final case class Pokemon(name: String, likes: Int = 0, dislikes: Int = 0)

object PokemonRegistryActor {

  final case class ActionPerformed(description: String)

  final case class GetPokemon(name: String)

  final case class LikePokemon(name: String)

  def props: Props = Props[PokemonRegistryActor]
}

class PokemonRegistryActor extends Actor with ActorLogging {

  import PokemonRegistryActor._

  var pokemons = Set(Pokemon("Pikachu"))

  def receive: Receive = {
    case GetPokemon(name) =>
      sender() ! pokemons.find(_.name.equalsIgnoreCase(name))
    case LikePokemon(name) =>
      pokemons = pokemons map { case p if p.name.equalsIgnoreCase(name) => p.copy(likes = p.likes + 1) }
      sender() ! ActionPerformed(s"Pokemon $name liked.")
  }
}
