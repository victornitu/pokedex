import * as R from 'ramda'
import { createActions, handleActions } from 'redux-actions'
import { call, put, takeEvery } from 'redux-saga/effects'

import { loadFirstPage, storePokemon, restorePokemon, unstorePokemon } from './services'

export const actions = createActions(
  'INIT_APP',
  'DISPLAY_MORE',
  'LOAD_POKEMONS',
  'APPEND_POKEMONS',
  'UPDATE_SEARCH',
  'TOGGLE_DETAILS',
  'ADD_DETAILS',
  'TOGGLE_BOOKMARK',
  'BOOKMARK_POKEMON',
  'UNBOOKMARK_POKEMON',
  'TOGGLE_ONLY_BOOKMARKED'
)

export const {
  initApp,
  loadPokemons,
  appendPokemons,
  displayMore,
  updateSearch,
  toggleDetails,
  addDetails,
  toggleBookmark,
  bookmarkPokemon,
  unbookmarkPokemon,
  toggleOnlyBookmarked
} = actions

const initialState = {
  limit: 20,
  pokemons: [],
  searches: [],
  bookmarkedOnly: false
}

const sequence = (...functions) => (state, action) => R.pipe(...functions)(action)(state, action)
const evolveState = (key, fn) => (state, action) => R.evolve({[key]: fn(state, action)}, state)

const increaseNumberOfVisiblePokemons = R.evolve({limit: R.add(10)})

const getPokemons = R.propOr([], 'payload')
const setDefaultValues = R.map(R.assoc('expanded', false))
const appendToExisting = R.compose(R.evolve, R.objOf('pokemons'), R.flip(R.concat))

const getSearchRequest = R.propOr('', 'payload')
const extractSearchParams = R.compose(R.filter(R.complement(R.isEmpty)), R.split(' '))

const getPokemonName = R.pathOr('', ['payload', 'name'])
const getPokemonDetails = R.pathOr('', ['payload', 'details'])
const getPokemonIndex = R.compose(R.findIndex, R.compose(R.propEq('name'), getPokemonName))
const toggleExpanded = R.evolve({expanded: R.not})
const bookmark = R.assoc('bookmarked', true)
const unbookmark = R.assoc('bookmarked', false)
const setLoadingDetails = R.assoc('loading', true)
const storeDetails = R.assoc('details')
const updateStatus = R.partial(R.pipe, [R.dissoc('loading'), R.assoc('expanded', true)])
const updatePokemon = (fn) => ({pokemons}, action) => R.adjust(fn)(getPokemonIndex(action)(pokemons))

export const reducer = handleActions({
  [displayMore]: increaseNumberOfVisiblePokemons,
  [appendPokemons]: sequence(R.pipe(getPokemons, setDefaultValues), appendToExisting),
  [updateSearch]: sequence(getSearchRequest, extractSearchParams, R.assoc('searches')),
  [toggleDetails]: (state, action) => {
    if (action.payload.details) {
      return evolveState('pokemons', updatePokemon(toggleExpanded))(state, action)
    }
    return evolveState('pokemons', updatePokemon(setLoadingDetails))(state, action)
  },
  [addDetails]: evolveState('pokemons', sequence(getPokemonDetails, storeDetails, updateStatus, updatePokemon)),
  [bookmarkPokemon]: evolveState('pokemons', updatePokemon(bookmark)),
  [unbookmarkPokemon]: evolveState('pokemons', updatePokemon(unbookmark)),
  [toggleOnlyBookmarked]: R.evolve({bookmarkedOnly: R.not})
}, initialState)

export const sagas = [
  function * () {
    yield takeEvery([initApp], function * () {
      yield put(loadPokemons(loadFirstPage))
    })
  },
  function * () {
    yield takeEvery([loadPokemons], function * (action) {
      const loadFunction = action.payload
      const {pokemons, loadNextPage} = yield call(loadFunction)
      yield put(appendPokemons(R.map(p => {
        const pokemon = restorePokemon(p)
        return R.assoc('bookmarked', !!pokemon, pokemon || p)
      }, pokemons)))
      loadNextPage && (yield put(loadPokemons(loadNextPage)))
    })
  },
  function * () {
    yield takeEvery([toggleDetails], function * (action) {
      if (action.payload.details) {
        return
      }
      const {name, loadDetails} = action.payload
      const details = yield call(loadDetails)
      yield put(addDetails({name, details}))
    })
  },
  function * () {
    yield takeEvery([toggleBookmark], function * (action) {
      const pokemon = action.payload
      if (pokemon.bookmarked) {
        unstorePokemon(pokemon)
        yield put(unbookmarkPokemon(pokemon))
      } else {
        storePokemon(pokemon)
        yield put(bookmarkPokemon(pokemon))
      }
    })
  }
]

export const getAppState = R.propOr(initialState, 'app')
