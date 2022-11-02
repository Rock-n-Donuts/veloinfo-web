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
            <div className={styles.left}>
                <button type="button" className={styles.menuToggler}>
                    Menu
                </button>
            </div>
            <div className={styles.dateRange}>DateRange</div>
            <div className={styles.filters}>Filters</div>
        </div>
    );
}

MapFilters.propTypes = propTypes;
MapFilters.defaultProps = defaultProps;

export default MapFilters;
