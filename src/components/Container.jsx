// import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';
import RelativeTimeFormat from 'relative-time-format';
import fr from 'relative-time-format/locale/fr';
import en from 'relative-time-format/locale/en';

import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import { FiltersProvider } from '../contexts/FiltersContext';
import App from './App';

import messagesFr from '../translations/fr.json';
import messagesEn from '../translations/en.json';

RelativeTimeFormat.addLocale(fr);
RelativeTimeFormat.addLocale(en);

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
                    <FiltersProvider>
                        <DataProvider>
                            <App />
                        </DataProvider>
                    </FiltersProvider>
                </AuthProvider>
            </BrowserRouter>
        </IntlProvider>
    );
}

Container.propTypes = propTypes;
Container.defaultProps = defaultProps;

export default Container;
