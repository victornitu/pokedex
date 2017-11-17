import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import styled from 'styled-components'
import * as R from 'ramda'

import { appTitle } from './config'

import Header from './components/Header'
import Toolbar from './components/Toolbar'
import Footer from './components/Footer'
import Pokemons from './components/Pokemons'

import { actions, getAppState } from './state'

const App = styled.div`
  background-color: aliceblue;
`

export default connect(
  getAppState,
  R.curry(bindActionCreators)(actions)
)(
  ({limit, pokemons, bookmarkedOnly, searches, updateSearch, toggleDetails, toggleBookmark, toggleOnlyBookmarked, displayMore}) => {
    const filterBySearches = R.filter(p => R.any(s => R.test(new RegExp(s, 'i'), p.name), searches))
    const filterBookmarked = R.filter(R.propEq('bookmarked', true))
    const filter = R.pipe(
      searches.length ? filterBySearches : R.identity,
      bookmarkedOnly ? filterBookmarked : R.identity
    )
    const filteredPokemons = filter(pokemons)
    const visiblePokemons = R.slice(0, limit, filteredPokemons)
    return (
      <App>
        <Header
          title={appTitle} />
        <Toolbar
          updateSearch={updateSearch}
          toggleOnlyBookmarked={toggleOnlyBookmarked} />
        <Pokemons
          pokemons={visiblePokemons}
          toggleDetails={toggleDetails}
          toggleBookmark={toggleBookmark} />
        <Footer
          disabled={filteredPokemons.length < limit}
          displayMore={displayMore} />
      </App>
    )
  }
)
