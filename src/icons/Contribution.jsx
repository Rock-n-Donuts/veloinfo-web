import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from '../styles/icons/contribution.module.scss';

import contributions from './contributions';

const propTypes = {
    icon: PropTypes.oneOf(['snow', 'warning', 'parking', 'heart', 'repair', 'camera']),
    color: PropTypes.string,
    withoutMarker: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    icon: 'snow',
    color: '#007E9C',
    withoutMarker: false,
    className: null,
};

function ContributionIcon({ icon, color, withoutMarker, className }) {
    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}>
            {!withoutMarker ? (
                <svg
                    className={styles.background}
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    width={42}
                    height={51}
                    viewBox="0 0 42 51"
                    fill="none"
                >
                    <mask id="path-1-inside-1_333_1482" fill="white">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M6 0C2.68629 0 0 2.68629 0 6V36C0 39.3137 2.68628 42 5.99999 42H12.1317L20.1818 50.2219L28.2319 42H35.1224C38.4361 42 41.1224 39.3137 41.1224 36V6C41.1224 2.68629 38.4361 0 35.1224 0H6Z"
                        />
                    </mask>
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6 0C2.68629 0 0 2.68629 0 6V36C0 39.3137 2.68628 42 5.99999 42H12.1317L20.1818 50.2219L28.2319 42H35.1224C38.4361 42 41.1224 39.3137 41.1224 36V6C41.1224 2.68629 38.4361 0 35.1224 0H6Z"
                        fill={color}
                    />
                    <path
                        d="M12.1317 42L12.8462 41.3004L12.5521 41H12.1317V42ZM20.1818 50.2219L19.4673 50.9215L20.1818 51.6513L20.8963 50.9215L20.1818 50.2219ZM28.2319 42V41H27.8115L27.5174 41.3004L28.2319 42ZM1 6C1 3.23858 3.23858 1 6 1V-1C2.13401 -1 -1 2.13401 -1 6H1ZM1 36V6H-1V36H1ZM5.99999 41C3.23857 41 1 38.7614 1 36H-1C-1 39.866 2.134 43 5.99999 43V41ZM12.1317 41H5.99999V43H12.1317V41ZM20.8963 49.5223L12.8462 41.3004L11.4171 42.6996L19.4673 50.9215L20.8963 49.5223ZM27.5174 41.3004L19.4673 49.5223L20.8963 50.9215L28.9465 42.6996L27.5174 41.3004ZM35.1224 41H28.2319V43H35.1224V41ZM40.1224 36C40.1224 38.7614 37.8838 41 35.1224 41V43C38.9884 43 42.1224 39.866 42.1224 36H40.1224ZM40.1224 6V36H42.1224V6H40.1224ZM35.1224 1C37.8838 1 40.1224 3.23857 40.1224 6H42.1224C42.1224 2.13401 38.9884 -1 35.1224 -1V1ZM6 1H35.1224V-1H6V1Z"
                        fill="white"
                        mask="url(#path-1-inside-1_333_1482)"
                    />
                </svg>
            ) : null}
            <div className={styles.content}>
                <div className={styles.center}>
                    <img src={contributions[icon]} alt={icon} />
                </div>
            </div>
        </div>
    );
}

ContributionIcon.propTypes = propTypes;
ContributionIcon.defaultProps = defaultProps;

export default ContributionIcon;
