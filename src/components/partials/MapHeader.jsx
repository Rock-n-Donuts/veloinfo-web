import PropTypes from 'prop-types';
import classNames from 'classnames';

import menuIcon from '../../assets/images/menu-icon.svg';
import chevronIcon from '../../assets/images/chevron-bottom.svg';
import snowIcon from '../../icons/contributions/snow.svg';

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
                <button type="button" className={styles.menuToggler} onClick={onTogglerClick}>
                    <img src={menuIcon} alt="Hambuger" />
                </button>
            </div>
            <div className={styles.center}>
                <button type="button" className={styles.dateRangeInner}>
                    <img src={snowIcon} alt="Snow" />
                    <span className={styles.label}>Depuis 5 jours</span>
                    <img src={chevronIcon} alt="Chevron" />
                </button>
            </div>
            <div className={styles.right}></div>
        </div>
    );
}

MapHeader.propTypes = propTypes;
MapHeader.defaultProps = defaultProps;

export default MapHeader;
