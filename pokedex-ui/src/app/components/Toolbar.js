import React from 'react'
import { Toolbar, ToolbarGroup, ToolbarTitle, ToolbarSeparator } from 'material-ui/Toolbar'
import TextField from 'material-ui/TextField'
import Toggle from 'material-ui/Toggle'

export default ({updateSearch, toggleOnlyBookmarked}) => (
  <Toolbar>
    <ToolbarGroup>
      <ToolbarTitle text='Search' />
      <TextField
        name='search'
        hintText='Pokemon by name...'
        onChange={(_, text) => updateSearch(text)} />
      <ToolbarSeparator />
    </ToolbarGroup>
    <ToolbarGroup>
      <Toggle
        label='Only bookmarked'
        onToggle={toggleOnlyBookmarked} />
    </ToolbarGroup>
  </Toolbar>
)
