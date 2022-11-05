// import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';
import messagesFr from '../translations/fr.json';
import messagesEn from '../translations/en.json';

import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import App from './App';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'api';
const apiProxyUrl = process.env.REACT_APP_API_PROXY_URL || '';
axios.defaults.baseURL = `${apiProxyUrl}${apiUrl}`;

const messages = {
    fr: messagesFr,
    en: messagesEn,
};

const propTypes = {};

const defaultProps = {};

function Container() {
    const locale = navigator.language;
    const language = locale.split(/[-_]/)[0];

    return (
        <IntlProvider locale={locale} messages={messages[language]}>
            <BrowserRouter>
                <AuthProvider>
                    <DataProvider>
                        <App />
                    </DataProvider>
                </AuthProvider>
            </BrowserRouter>
        </IntlProvider>
    );
}

Container.propTypes = propTypes;
Container.defaultProps = defaultProps;

export default Container;
