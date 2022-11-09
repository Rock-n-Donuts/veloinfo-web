import { FormattedMessage, useIntl } from 'react-intl';
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
    const intl = useIntl();
    const { locale } = intl;
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
                <div className={styles.notifyCity}>
                    <div className={styles.label}>
                        <FormattedMessage id="inform-city" />
                    </div>
                    <div className={styles.links}>
                        <a
                            href={
                                locale === 'en'
                                    ? 'https://montreal.ca/en/how-to/request-installation-bicycle-rack'
                                    : 'https://montreal.ca/demarches/demander-linstallation-dun-support-velo'
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            <FormattedMessage id="bike-rack-request" />
                        </a>
                        <a
                            href={
                                locale === 'en'
                                    ? 'https://montreal.ca/en/how-to/report-pothole'
                                    : 'https://montreal.ca/requetes311/signaler-nid-poule/emplacement'
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            <FormattedMessage id="pothole-report" />
                        </a>
                        <a
                            href={
                                locale === 'en'
                                    ? 'https://montreal.ca/en/how-to/report-snow-removal-issue'
                                    : 'https://montreal.ca/demarches/signaler-un-probleme-de-deneigement'
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            <FormattedMessage id="snow-removal-issue-report" />
                        </a>
                    </div>
                </div>
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
