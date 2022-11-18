import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useIntl } from 'react-intl';

import CloseIcon from '../../icons/Close';
import menuIcon from '../../assets/images/menu-icon.svg';

import styles from '../../styles/buttons/menu.module.scss';

const propTypes = {
    opened: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func,
};

const defaultProps = {
    opened: false,
    className: null,
    onClick: null,
};

function MenuButton({ className, opened, onClick }) {
    const intl = useIntl();
    return (
        <button
            type="button"
            className={classNames([
                styles.container,
                { [className]: className !== null, [styles.opened]: opened },
            ])}
            onClick={onClick}
        >
            <span>
                <img
                    className={styles.menu}
                    src={menuIcon}
                    alt={intl.formatMessage({
                        id: 'menu',
                    })}
                />
            </span>
            <CloseIcon className={styles.close} />
        </button>
    );
}

MenuButton.propTypes = propTypes;
MenuButton.defaultProps = defaultProps;

export default MenuButton;
