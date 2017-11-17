import React from 'react'
import styled from 'styled-components'
import * as R from 'ramda'

import { List, ListItem } from 'material-ui/List'
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import Checkbox from 'material-ui/Checkbox'
import ActionBookmark from 'material-ui/svg-icons/action/bookmark'
import ActionBookmarkBorder from 'material-ui/svg-icons/action/bookmark-border'
import Img from 'react-image'

import logo from '../assets/pokeball.png'
import PokemonDetails from './PokemonDetails'
import Loader from './Loader'

const PokeHeader = styled(CardHeader)`
  background-color: #CCC;
  color: white;
`
const PokeActions = styled(CardActions)`
  margin: 10px;
`
const Avatar = styled(Img)`
  height: 80px;
  margin: auto;
`
const PokemonAvatar = ({src}) => (
  <Avatar src={src} loader={<Loader />} />
)
const DefaultAvatar = ({src}) => (
  <Avatar src={src} />
)
const avatar = (pokemon) => {
  if (pokemon.loading) {
    return <Loader />
  }
  if (pokemon.details) {
    return <PokemonAvatar src={pokemon.details.avatar} />
  }
  return <DefaultAvatar src={logo} />
}

const Pokemon = ({pokemon, toggleDetails, toggleBookmark}) => (
  <ListItem>
    <Card
      expanded={pokemon.expanded}
      onExpandChange={() => toggleDetails(pokemon)}>
      <PokeHeader
        title={pokemon.name}
        subtitle={`#${pokemon.id}`}
        avatar={avatar(pokemon)}
        showExpandableButton />
      <CardText expandable>
        <PokemonDetails details={pokemon.details} />
      </CardText>
      <PokeActions>
        <Checkbox
          checked={pokemon.bookmarked}
          onCheck={() => toggleBookmark(pokemon)}
          checkedIcon={<ActionBookmark />}
          uncheckedIcon={<ActionBookmarkBorder />}
          disabled={!pokemon.details}
        />
      </PokeActions>
    </Card>
  </ListItem>
)

export default ({pokemons, toggleDetails, toggleBookmark}) => (
  <List>
    {
      R.map(pokemon => (
        <Pokemon
          pokemon={pokemon}
          toggleDetails={toggleDetails}
          toggleBookmark={toggleBookmark}
          key={pokemon.name} />
      ), pokemons)
    }
  </List>
)
