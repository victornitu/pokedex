import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'

import rootReducer from './reducers'
import {actions, sagas as appSagas} from '../app/state'

export default (initialState = {}) => {
  const sagaMiddleware = createSagaMiddleware()
  const enhancers = [
    applyMiddleware(sagaMiddleware)
  ]
  const store = createStore(rootReducer, initialState, ...enhancers)
  appSagas.forEach(sagaMiddleware.run)
  store.dispatch(actions.initApp())
  return store
}
