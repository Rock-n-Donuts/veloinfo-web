import classNames from 'classnames';
import PropTypes from 'prop-types';

import styles from '../styles/icons/comments.module.scss';

const propTypes = {
    color: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    color: 'currentColor',
    className: null,
};

function MenuIcon({ color, className }) {
    return (
        <svg
            className={classNames([styles.container, { [className]: className !== null }])}
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width={26}
            height={17}
            viewBox="0 0 26 17"
            fill="none"
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0 1C0 0.447715 0.447715 0 1 0H25C25.5523 0 26 0.447715 26 1C26 1.55228 25.5523 2 25 2H1C0.447715 2 0 1.55228 0 1Z"
                fill={color}
            />
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0 8.30768C0 7.75539 0.447715 7.30768 1 7.30768H25C25.5523 7.30768 26 7.75539 26 8.30768C26 8.85996 25.5523 9.30768 25 9.30768H1C0.447715 9.30768 0 8.85996 0 8.30768Z"
                fill={color}
            />
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0 16C0 15.4477 0.447715 15 1 15H25C25.5523 15 26 15.4477 26 16C26 16.5523 25.5523 17 25 17H1C0.447715 17 0 16.5523 0 16Z"
                fill={color}
            />
        </svg>
    );
}

MenuIcon.propTypes = propTypes;
MenuIcon.defaultProps = defaultProps;

export default MenuIcon;
