import PropTypes from 'prop-types';
import classNames from 'classnames';

import DateFilter from './DateFilter';
import LayersFilter from './LayersFilter';

import styles from '../../styles/partials/map-header.module.scss';

const propTypes = {
    className: PropTypes.string,
    onTogglerClick: PropTypes.func,
};

const defaultProps = {
    className: null,
    onTogglerClick: null,
};

function MapHeader({ className }) {
    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}>
            <div className={styles.left}>
            </div>
            <div className={styles.center}>
                <DateFilter />
            </div>
            <div className={styles.right}>
                <LayersFilter />
            </div>
        </div>
    );
}

MapHeader.propTypes = propTypes;
MapHeader.defaultProps = defaultProps;

export default MapHeader;
