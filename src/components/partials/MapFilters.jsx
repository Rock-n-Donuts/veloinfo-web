import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from '../../styles/partials/map-filters.module.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

function MapFilters({ className }) {
    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}>
            Filters
        </div>
    );
}

MapFilters.propTypes = propTypes;
MapFilters.defaultProps = defaultProps;

export default MapFilters;
