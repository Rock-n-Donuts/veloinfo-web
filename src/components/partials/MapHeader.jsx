import PropTypes from 'prop-types';
import classNames from 'classnames';

import TimeFilter from '../filters/TimeFilter';
import LayersFilter from '../filters/LayersFilter';
import MenuButton from '../buttons/Menu';

import styles from '../../styles/partials/map-header.module.scss';

const propTypes = {
    className: PropTypes.string,
    onTogglerClick: PropTypes.func,
    timeFilterOpened: PropTypes.bool,
    layersFilterOpened: PropTypes.bool,
};

const defaultProps = {
    className: null,
    onTogglerClick: null,
    timeFilterOpened: false,
    layersFilterOpened: false,
};

function MapHeader({ className, onTogglerClick, timeFilterOpened, layersFilterOpened }) {
    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}>
            <div className={styles.left}>
                <MenuButton className={styles.menuButton} onClick={onTogglerClick} />
            </div>
            <div className={styles.center}>
                <TimeFilter className={styles.timeFilter} opened={timeFilterOpened} />
            </div>
            <div className={styles.right}>
                <LayersFilter className={styles.layersFilter} opened={layersFilterOpened} />
            </div>
        </div>
    );
}

MapHeader.propTypes = propTypes;
MapHeader.defaultProps = defaultProps;

export default MapHeader;
