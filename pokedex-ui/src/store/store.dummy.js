import { createStore } from 'redux'

import rootReducer from './reducers'
import {actions} from '../app/state'

export default (initialState = {}) => {
  const store = createStore(rootReducer, initialState)
  store.dispatch(actions.initApp())
  return store
}
