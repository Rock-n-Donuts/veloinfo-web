import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';


import contributionTypes from '../../data/contributions-types.json';
import ContributionIcon from '../../icons/Contribution';
import styles from '../../styles/partials/home-menu.module.scss';

const propTypes = {
    className: PropTypes.string,
    opened: PropTypes.bool,
};

const defaultProps = {
    className: null,
    opened: false,
};

function HomeMenu({ className, opened }) {
    const intl = useIntl();
    const { locale } = intl;
    const shortLocale = locale.substring(0, 2);

    return (
        <div
            className={classNames([
                styles.container,
                { [className]: className !== null, [styles.opened]: opened },
            ])}
        >
            <div className={styles.content}>
                <h1 className={styles.title}>Info vélo</h1>
                <div className={styles.legend}>
                    <div className={styles.legendLabel}>
                        <FormattedMessage id="legend" />
                    </div>
                    <div className={styles.contributionTypes}>
                        {contributionTypes.map(({ icon, color, label }, contributionTypeIndex) => (
                            <div
                                key={`contribution-type-${contributionTypeIndex}`}
                                className={styles.contributionType}
                            >
                                <ContributionIcon
                                    className={styles.icon}
                                    icon={icon}
                                    color={color}
                                />
                                <span className={styles.label}>{label[shortLocale]}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.pathsStatusContainer}>
                        <div className={styles.pathsStatusLabel}>
                            <FormattedMessage id="paths-status" />
                        </div>
                        <div className={styles.note}>
                            <FormattedMessage id="paths-status-note" />
                        </div>
                        <div className={styles.pathsStatus}>
                            <div className={styles.pathStatus}>
                                <span
                                    className={styles.line}
                                    style={{ backgroundColor: '#4fae77' }}
                                />
                                <span className={styles.label}>Déneigé</span>
                            </div>
                            <div className={styles.pathStatus}>
                                <span
                                    className={styles.line}
                                    style={{ backgroundColor: '#367c98' }}
                                />
                                <span className={styles.label}>Enneigé</span>
                            </div>
                            <div className={styles.pathStatus}>
                                <span
                                    className={styles.line}
                                    style={{ backgroundColor: '#f09035' }}
                                />
                                <span className={styles.label}>Déneigement planifié</span>
                            </div>
                            <div className={styles.pathStatus}>
                                <span
                                    className={styles.line}
                                    style={{ backgroundColor: '#8962c7' }}
                                />
                                <span className={styles.label}>Déneigement en cours</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.notifyCity}>
                    <div className={styles.label}>Informer la ville</div>
                    <div className={styles.links}>
                        <a
                            href="https://montreal.ca/demarches/demander-linstallation-dun-support-velo"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Demander l'ajout d'un rack à vélo
                        </a>
                        <a
                            href="https://montreal.ca/requetes311/signaler-nid-poule/emplacement"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Signaler un nid de poule
                        </a>
                        <a
                            href="https://montreal.ca/demarches/signaler-un-probleme-de-deneigement"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Signaler un déneigement manquant
                        </a>
                    </div>
                </div>
                <div className={styles.footer}>Rock n Donuts 🍩</div>
            </div>
        </div>
    );
}

HomeMenu.propTypes = propTypes;
HomeMenu.defaultProps = defaultProps;

export default HomeMenu;
