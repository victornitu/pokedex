import React from 'react'
import styled from 'styled-components'

import logo from '../assets/pokeball.png'

const Header = styled.header`
  background-color: #222;
  height: 40px;
  padding: 20px;
  color: white;
  text-align: center;
`
const Title = styled.h1`
  font-size: 2em;
  margin: auto;
  display: inline-block;
`
const Logo = styled.img`
  height: 40px;
  margin: auto;
  display: inline-block;
  vertical-align: bottom;
`

export default ({title}) => (
  <Header>
    <Logo
      src={logo}
      alt='logo' />
    <Title>{title}</Title>
  </Header>
)
