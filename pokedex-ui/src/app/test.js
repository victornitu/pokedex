import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import configureStore from '../store'
import App from '../app'
import {
  reducer,
  appendPokemons,
  displayMore,
  updateSearch,
  toggleDetails,
  addDetails,
  bookmarkPokemon,
  unbookmarkPokemon
} from './state'

it('renders without crashing', () => {
  render(
    <Provider store={configureStore()}>
      <MuiThemeProvider>
        <App />
      </MuiThemeProvider>
    </Provider>,
    document.createElement('div')
  )
})

const initialState = {
  limit: 20,
  pokemons: [
    {
      name: 'poke1',
      expanded: false,
      bookmarked: false
    },
    {
      name: 'poke2',
      expanded: false,
      bookmarked: false
    },
    {
      name: 'poke3',
      expanded: false,
      bookmarked: false
    }
  ],
  searches: ['Bulb', 'Ivy'],
  bookmarkedOnly: false
}

it('handles display more pokemons', () => {
  const action = displayMore()
  const result = reducer(initialState, action)
  expect(result).toEqual({
    limit: 30,
    pokemons: [
      {
        name: 'poke1',
        expanded: false,
        bookmarked: false
      },
      {
        name: 'poke2',
        expanded: false,
        bookmarked: false
      },
      {
        name: 'poke3',
        expanded: false,
        bookmarked: false
      }
    ],
    searches: ['Bulb', 'Ivy'],
    bookmarkedOnly: false
  })
})

it('handles append pokemons', () => {
  const action = appendPokemons([
    {
      name: 'poke4',
      bookmarked: false
    },
    {
      name: 'poke5',
      bookmarked: false
    }
  ])
  const result = reducer(initialState, action)
  expect(result).toEqual({
    limit: 20,
    pokemons: [
      {
        name: 'poke1',
        expanded: false,
        bookmarked: false
      },
      {
        name: 'poke2',
        expanded: false,
        bookmarked: false
      },
      {
        name: 'poke3',
        expanded: false,
        bookmarked: false
      },
      {
        name: 'poke4',
        expanded: false,
        bookmarked: false
      },
      {
        name: 'poke5',
        expanded: false,
        bookmarked: false
      }
    ],
    searches: ['Bulb', 'Ivy'],
    bookmarkedOnly: false
  })
})

it('handles update search', () => {
  const action = updateSearch('Sh ditto')
  const result = reducer(initialState, action)
  expect(result).toEqual({
    limit: 20,
    pokemons: [
      {
        name: 'poke1',
        expanded: false,
        bookmarked: false
      },
      {
        name: 'poke2',
        expanded: false,
        bookmarked: false
      },
      {
        name: 'poke3',
        expanded: false,
        bookmarked: false
      }
    ],
    searches: ['Sh', 'ditto'],
    bookmarkedOnly: false
  })
})

it('handles toggle details and then add details', () => {
  const firstAction = toggleDetails({name: 'poke2'})
  const secondAction = addDetails({
    name: 'poke2',
    details: {
      height: 10,
      weight: 20
    }
  })
  const intermediateState = reducer(initialState, firstAction)
  expect(intermediateState).toEqual({
    limit: 20,
    pokemons: [
      {
        name: 'poke1',
        expanded: false,
        bookmarked: false
      },
      {
        name: 'poke2',
        expanded: false,
        loading: true,
        bookmarked: false
      },
      {
        name: 'poke3',
        expanded: false,
        bookmarked: false
      }
    ],
    searches: ['Bulb', 'Ivy'],
    bookmarkedOnly: false
  })
  const finalState = reducer(intermediateState, secondAction)
  expect(finalState).toEqual({
    limit: 20,
    pokemons: [
      {
        name: 'poke1',
        expanded: false,
        bookmarked: false
      },
      {
        name: 'poke2',
        expanded: true,
        bookmarked: false,
        details: {
          height: 10,
          weight: 20
        }
      },
      {
        name: 'poke3',
        expanded: false,
        bookmarked: false
      }
    ],
    searches: ['Bulb', 'Ivy'],
    bookmarkedOnly: false
  })
})

it('handles bookmark pokemon', () => {
  const firstAction = bookmarkPokemon({name: 'poke2'})
  const secondAction = unbookmarkPokemon({name: 'poke2'})
  const intermediateState = reducer(initialState, firstAction)
  expect(intermediateState).toEqual({
    limit: 20,
    pokemons: [
      {
        name: 'poke1',
        expanded: false,
        bookmarked: false
      },
      {
        name: 'poke2',
        expanded: false,
        bookmarked: true
      },
      {
        name: 'poke3',
        expanded: false,
        bookmarked: false
      }
    ],
    searches: ['Bulb', 'Ivy'],
    bookmarkedOnly: false
  })
  const finalState = reducer(intermediateState, secondAction)
  expect(finalState).toEqual({
    limit: 20,
    pokemons: [
      {
        name: 'poke1',
        expanded: false,
        bookmarked: false
      },
      {
        name: 'poke2',
        expanded: false,
        bookmarked: false
      },
      {
        name: 'poke3',
        expanded: false,
        bookmarked: false
      }
    ],
    searches: ['Bulb', 'Ivy'],
    bookmarkedOnly: false
  })
})
