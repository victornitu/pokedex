import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import './index.css'
import configureStore from './store'
import App from './app'
import registerServiceWorker from './registerServiceWorker'

render(
  <Provider store={configureStore()}>
    <MuiThemeProvider>
      <App />
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('root')
)
registerServiceWorker()
