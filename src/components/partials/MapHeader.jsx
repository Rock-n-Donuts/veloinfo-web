import PropTypes from 'prop-types';
import classNames from 'classnames';

import TimeFilter from './TimeFilter';
import LayersFilter from './LayersFilter';
import MenuButton from '../buttons/Menu';

import styles from '../../styles/partials/map-header.module.scss';

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
                <TimeFilter className={styles.timeFilter} />
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
