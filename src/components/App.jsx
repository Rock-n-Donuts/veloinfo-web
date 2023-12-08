// import PropTypes from 'prop-types';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { IntlProvider } from 'react-intl';
import { Route, Routes } from 'react-router-dom';
import RelativeTimeFormat from 'relative-time-format';
import fr from 'relative-time-format/locale/fr';
import en from 'relative-time-format/locale/en';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

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
            <GoogleReCaptchaProvider
                reCaptchaKey={process.env.REACT_APP_RECAPTCHA_V3_SITE_KEY}
                language={locale}
            >
                <MainLayout>
                    <Routes>
                        <Route path="/" exact element={<HomePage />} />
                        <Route path="/contribution/:id" exact element={<HomePage />} />
                        <Route path="/ajouter" exact element={<HomePage addContribution />} />
                        <Route path="/signaler" exact element={<HomePage report />} />
                        <Route path="*" element={<ErrorPage />} />
                    </Routes>
                    {process.env.NODE_ENV === 'production' ? <Analytics /> : null}
                    {process.env.NODE_ENV === 'production' ? <SpeedInsights /> : null}
                </MainLayout>
            </GoogleReCaptchaProvider>
        </IntlProvider>
    );
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;
