import PropTypes from 'prop-types';
import classNames from 'classnames';
import CloseButton from '../buttons/Close';

import styles from '../../styles/partials/home-menu.module.scss';

const propTypes = {
    className: PropTypes.string,
    opened: PropTypes.bool,
    onClose: PropTypes.func,
};

const defaultProps = {
    className: null,
    opened: false,
    onClose: null,
};

function HomeMenu({ className, opened, onClose }) {
    return (
        <div className={classNames([styles.container, { [className]: className !== null, [styles.opened]: opened }])}>
            <CloseButton className={styles.closeButton} onClick={onClose} />
        </div>
    );
}

HomeMenu.propTypes = propTypes;
HomeMenu.defaultProps = defaultProps;

export default HomeMenu;
