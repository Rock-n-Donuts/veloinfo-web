// import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import { Route, Routes } from 'react-router-dom';
import RelativeTimeFormat from 'relative-time-format';
import fr from 'relative-time-format/locale/fr';
import en from 'relative-time-format/locale/en';

// import * as AppPropTypes from '../lib/PropTypes';
import { useLocale } from '../contexts/SiteContext';
import MainLayout from './layouts/Main';
import HomePage from './pages/Home';
import ErrorPage from './pages/Error';
import messagesFr from '../translations/fr.json';
import messagesEn from '../translations/en.json';

import '../styles/index.scss';

RelativeTimeFormat.addLocale(fr);
RelativeTimeFormat.addLocale(en);

const messages = {
    fr: messagesFr,
    en: messagesEn,
};

const propTypes = {};

const defaultProps = {};

function App() {
    const locale = useLocale();
    return (
        <IntlProvider locale={locale} messages={messages[locale]}>
            <MainLayout>
                <Routes>
                    <Route path="/" exact element={<HomePage />} />
                    <Route path="/contribution/:id" exact element={<HomePage />} />
                    <Route path="*" element={<ErrorPage />} />
                </Routes>
            </MainLayout>
        </IntlProvider>
    );
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;
