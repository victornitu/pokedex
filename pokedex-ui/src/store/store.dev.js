import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'
import { createLogger } from 'redux-logger'

import rootReducer from '../store/reducers'
import {actions, sagas as appSagas} from '../app/state'

export default (initialState = {}) => {
  const sagaMiddleware = createSagaMiddleware()
  const logger = createLogger({
    duration: true,
    timestamp: true
  })
  const enhancers = [
    applyMiddleware(sagaMiddleware, logger)
  ]
  const composeEnhancers = composeWithDevTools(
    {
      // other compose enhancers if any
      // Specify here other options if needed
    }
  )
  const store = createStore(rootReducer, initialState, composeEnhancers(...enhancers))
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../store/reducers', () => {
      /* eslint-disable global-require */
      const nextReducer = require('../store/reducers').default
      store.replaceReducer(nextReducer)
    })
  }
  appSagas.forEach(sagaMiddleware.run)
  store.dispatch(actions.initApp())
  return store
}
