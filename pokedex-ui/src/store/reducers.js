import { combineReducers } from 'redux'

import { reducer as app } from '../app/state'

const rootReducer = combineReducers({
  app
})

export default rootReducer
