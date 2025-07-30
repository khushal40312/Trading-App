import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import tradexStore from './store/index.js'
import 'react-loading-skeleton/dist/skeleton.css'
createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <Provider store={tradexStore}>
      <BrowserRouter >
        <App />
      </BrowserRouter>
    </Provider>
  // </StrictMode>,
)
