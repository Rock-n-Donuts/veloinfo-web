import classNames from 'classnames';
import PropTypes from 'prop-types';

import styles from '../styles/icons/comments.module.scss';

const propTypes = {
    colored: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    colored: false,
    className: null,
};

function CommentsIcon({ colored, className }) {
    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}>
            <svg
                className={styles.background}
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                width={23}
                height={23}
                viewBox="0 0 23 23"
                fill="none"
            >
                <circle cx="11.5" cy="11.5" r="11.5" fill={colored ? '#007E9C' : '#AAA'} />
                <rect x="12" y="12" width="10" height="10" fill={colored ? '#007E9C' : '#AAA'} />
                <circle cx="6.5" cy="11.5" r="1.5" fill="white" />
                <circle cx="11.5" cy="11.5" r="1.5" fill="white" />
                <circle cx="16.5" cy="11.5" r="1.5" fill="white" />
            </svg>
        </div>
    );
}

CommentsIcon.propTypes = propTypes;
CommentsIcon.defaultProps = defaultProps;

export default CommentsIcon;
