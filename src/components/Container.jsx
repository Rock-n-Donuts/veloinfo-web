// import PropTypes from 'prop-types';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import { FiltersProvider } from '../contexts/FiltersContext';
import { SiteProvider } from '../contexts/SiteContext';

import App from './App';

const propTypes = {};

const defaultProps = {};

function Container() {
    return (
        <AuthProvider>
            <FiltersProvider>
                <DataProvider>
                    <SiteProvider>
                        <BrowserRouter>
                            <App />
                        </BrowserRouter>
                    </SiteProvider>
                </DataProvider>
            </FiltersProvider>
        </AuthProvider>
    );
}

Container.propTypes = propTypes;
Container.defaultProps = defaultProps;

export default Container;
