import React from 'react'
import styled, { keyframes } from 'styled-components'

import logo from '../assets/pokeball.png'

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`
const Img = styled.img`
  animation: ${rotate360} infinite 1s linear;
  height: 80px;
  margin: auto;
`

export default () => (
  <Img src={logo} alt='loader' />
)
