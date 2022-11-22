import '@openlayers/pepjs';
import axios from 'axios';
import ReactDOM from 'react-dom/client';

import Container from './components/Container';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import './styles/index.scss';

const apiUrl = process.env.REACT_APP_API_URL || 'api';
const apiProxyUrl = process.env.REACT_APP_API_PROXY_URL || '';
axios.defaults.baseURL = `${apiProxyUrl}${apiUrl}`;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    // <React.StrictMode>
    <Container />,
    // </React.StrictMode>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
