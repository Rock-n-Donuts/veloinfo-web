import classNames from 'classnames';
import PropTypes from 'prop-types';

import styles from '../styles/icons/close.module.scss';

const propTypes = {
    color: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    color: 'currentColor',
    className: null,
};

function CloseIcon({ color, className }) {
    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}>
            <svg
                className={styles.background}
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                width={30}
                height={30}
                viewBox="0 0 30 30"
                fill="none"
            >
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.43934 5.43934C5.02513 4.85355 5.97487 4.85355 6.56066 5.43934L14.5 13.3787L22.4393 5.43934C23.0251 4.85355 23.9749 4.85355 24.5607 5.43934C25.1464 6.02513 25.1464 6.97487 24.5607 7.56066L16.6213 15.5L24.5607 23.4393C25.1464 24.0251 25.1464 24.9749 24.5607 25.5607C23.9749 26.1464 23.0251 26.1464 22.4393 25.5607L14.5 17.6213L6.56066 25.5607C5.97487 26.1464 5.02513 26.1464 4.43934 25.5607C3.85355 24.9749 3.85355 24.0251 4.43934 23.4393L12.3787 15.5L4.43934 7.56066C3.85355 6.97487 3.85355 6.02513 4.43934 5.43934Z"
                    fill={color}
                />
            </svg>
        </div>
    );
}

CloseIcon.propTypes = propTypes;
CloseIcon.defaultProps = defaultProps;

export default CloseIcon;
