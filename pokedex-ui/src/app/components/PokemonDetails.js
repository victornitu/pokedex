import React from 'react'
import styled from 'styled-components'
import * as R from 'ramda'

import Chip from 'material-ui/Chip'
import Divider from 'material-ui/Divider'

import Loader from './Loader'

const Details = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 10px;
`
const Types = styled.div`
  grid-column: 1;
  grid-row: 1;
`
const Size = styled.div`
  grid-column: 1;
  grid-row: 2;
`
const Stats = styled.div`
  grid-column: 2 / 7;
  grid-row: 2 / 4;
  
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
`
const InforBoxTitle = styled.h3`
  text-align: right;
  margin-right: 10%;
`
const InfoTitle = styled.h4`
  text-align: right;
  color: red;
  margin-right: 10%;
  small {
    color: black;
  }
`
const styles = {
  chip: {
    margin: 4
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap'
  }
}
const InfoBox = ({name, children}) => (
  <div>
    <InforBoxTitle>{name}</InforBoxTitle>
    <Divider />
    <div>{children}</div>
  </div>
)
const Info = ({title, value}) => (
  <InfoTitle><small>{title}</small> {value}</InfoTitle>
)

export default ({details}) => details ? (
  <Details>
    <Types style={styles.wrapper}>
      {
        R.map(t => <Chip style={styles.chip} key={t}>{t}</Chip>, details.types)
      }
    </Types>
    <Size>
      <InfoBox name={'size'}>
        <Info title={'Height'} value={details.height} />
        <Info title={'Weight'} value={details.weight} />
      </InfoBox>
    </Size>
    <Stats>
      {
        R.map(s => (
          <InfoBox name={s.name} key={s.name}>
            <Info title={'Base stat'} value={s.baseStat} />
            <Info title={'Effort'} value={s.effort} />
          </InfoBox>
        ), details.stats)
      }
    </Stats>
  </Details>
) : (
  <Loader />
)
