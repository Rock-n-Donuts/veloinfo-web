// import PropTypes from 'prop-types';
import { Route, Routes } from 'react-router-dom';
// import * as AppPropTypes from '../lib/PropTypes';
import MainLayout from './layouts/Main';
import HomePage from './pages/Home';
import ErrorPage from './pages/Error';

import '../styles/index.scss';

const propTypes = {};

const defaultProps = {};

function App() {
    return (
        <MainLayout>
            <Routes>
                <Route path="/" exact element={<HomePage />} />
                <Route path="*" element={<ErrorPage />} />
            </Routes>
        </MainLayout>
    );
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;
