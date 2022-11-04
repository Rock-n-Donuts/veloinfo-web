import PropTypes from 'prop-types';
import classNames from 'classnames';

import menuIcon from '../../assets/images/menu-icon.svg';

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
            <button type="button" className={styles.menuToggler} onClick={onTogglerClick}>
                <img src={menuIcon} alt="Hambuger" />
            </button>
            <div className={styles.dateRange}>DateRange</div>
            <div className={styles.meteo}></div>
        </div>
    );
}

MapHeader.propTypes = propTypes;
MapHeader.defaultProps = defaultProps;

export default MapHeader;
