import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import CloseButton from '../buttons/Close';
import LocaleSelector from './LocaleSelector';

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
        <div
            className={classNames([
                styles.container,
                { [className]: className !== null, [styles.opened]: opened },
            ])}
        >
            <div className={styles.content}>
                <h1 className={styles.title}>
                    <FormattedMessage id="app-title" />
                </h1>
                <LocaleSelector className={styles.localeSelector} />
                <p className={styles.description}>
                    <FormattedMessage id="app-description" values={{ br: <br /> }} />
                </p>
                <div className={styles.footer}>
                    <a href="https://github.com/Rock-n-Donuts" target="_blank" rel="noreferrer">
                        🍩 Rock n Donuts
                    </a>
                    <a href="mailto:rock.n.donuts.velo@gmail.com" target="_blank" rel="noreferrer">
                        ✉️ Contact
                    </a>
                </div>
            </div>
            <CloseButton className={styles.closeButton} onClick={onClose} />
        </div>
    );
}

HomeMenu.propTypes = propTypes;
HomeMenu.defaultProps = defaultProps;

export default HomeMenu;
