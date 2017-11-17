import React from 'react'
import styled from 'styled-components'
import RaisedButton from 'material-ui/RaisedButton'

const Footer = styled.footer`
  padding: 20px;
  text-align: center;
`

export default ({disabled, displayMore}) => (
  <Footer>
    <RaisedButton
      label='More'
      disabled={disabled}
      onClick={displayMore} />
  </Footer>
)
