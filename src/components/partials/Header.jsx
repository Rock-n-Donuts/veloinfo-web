import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from '../../styles/partials/header.module.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

function Header({ className }) {
    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}></div>
    );
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default Header;
