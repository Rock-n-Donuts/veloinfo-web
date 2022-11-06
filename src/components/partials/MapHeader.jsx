import PropTypes from 'prop-types';
import classNames from 'classnames';

import DateFilter from './DateFilter';
import LayersFilter from './LayersFilter';

import styles from '../../styles/partials/map-header.module.scss';
import MenuButton from '../buttons/Menu';

const propTypes = {
    className: PropTypes.string,
    onTogglerClick: PropTypes.func,
};

const defaultProps = {
    className: null,
    onTogglerClick: null,
};

function MapHeader({ className, onTogglerClick }) {
    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}>
            <div className={styles.left}>
                <MenuButton className={styles.menuButton} onClick={onTogglerClick} />
            </div>
            <div className={styles.center}>
                <DateFilter className={styles.dateFilter} />
            </div>
            <div className={styles.right}>
                <LayersFilter className={styles.layersFilter} />
            </div>
        </div>
    );
}

MapHeader.propTypes = propTypes;
MapHeader.defaultProps = defaultProps;

export default MapHeader;
