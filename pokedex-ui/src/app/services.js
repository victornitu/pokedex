/* global localStorage */

import axios from 'axios'
import * as R from 'ramda'

import { baseUrl } from './config'

const extractId = (url) => R.nth(1, url.match(new RegExp(`^https?://${baseUrl}/pokemon/(\\d*)/$`, 'i')) || [null, 'N/A'])

const parsePokemonDetails = ({height, weight, types, sprites, stats}) => ({
  height,
  weight,
  avatar: sprites.front_default,
  types: R.map(t => t.type.name, types),
  stats: R.map(s => ({
    name: s.stat.name,
    baseStat: s.base_stat,
    effort: s.effort
  }), stats)
})

const parsePokemonSummary = ({name, url}) => ({
  name,
  id: extractId(url),
  loadDetails: async () => loadPokemonDetails(url)
})

const parsePokemonPage = ({results, previous, next}) => ({
  pokemons: R.map(parsePokemonSummary, results),
  loadPreviousPage: previous && (async () => loadPokemonPage(previous)),
  loadNextPage: next && (async () => loadPokemonPage(next))
})

async function loadPokemonDetails (url) {
  const {data} = await axios.get(url)
  return parsePokemonDetails(data)
}

async function loadPokemonPage (url = `http://${baseUrl}/pokemon`) {
  const {data} = await axios.get(url)
  return parsePokemonPage(data)
}

export const loadFirstPage = () => loadPokemonPage()

const storageKey = p => `VVF.LUXEMBOURG.POKEDEX.POKEMON.${p.name}`

export const storePokemon = (pokemon) => pokemon && localStorage.setItem(storageKey(pokemon), JSON.stringify(pokemon))
export const restorePokemon = (pokemon) => JSON.parse(localStorage.getItem(storageKey(pokemon)))
export const unstorePokemon = (pokemon) => localStorage.removeItem(storePokemon(pokemon))
