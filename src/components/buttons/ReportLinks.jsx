import { useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

import ContributionIcon from '../../icons/Contribution';
import reportLinks from '../../data/report-links.json';

import styles from '../../styles/buttons/report-links.module.scss';

const propTypes = {
    className: PropTypes.string,
    opened: PropTypes.bool,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
};

const defaultProps = {
    className: null,
    opened: false,
    onOpen: null,
    onClose: null,
};

function ReportLinksButton({ className, opened, onOpen, onClose }) {
    const { locale } = useIntl();

    const open = useCallback( () => {
        if (onOpen !== null) {
            onOpen();
        }
    }, [onOpen]);

    const close = useCallback( () => {
        if (onClose !== null) {
            onClose();
        }
    }, [onClose]);

    const toggleOpen = useCallback(() => {
        if (opened) {
            close();
        } else {
            open();
        }
    }, [opened, open, close]);

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                    [styles.opened]: opened,
                },
            ])}
        >
            <div className={styles.links}>
                {reportLinks.map((reportLink, reportIndex) => {
                    const { label, icon, color, link } = reportLink;

                    return (
                        <div key={`report-${reportIndex}`} className={styles.linkContainer}>
                            <div
                                className={styles.linkContent}
                                style={{
                                    transitionDelay: `${
                                        (reportLinks.length - 1 - reportIndex) * 0.03
                                    }s`,
                                }}
                            >
                                <a
                                    href={link[locale]}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={styles.link}
                                    onClick={close}
                                    style={{
                                        borderColor: color,
                                    }}
                                >
                                    <span
                                        className={styles.iconContainer}
                                        style={{ backgroundColor: color }}
                                    >
                                        <ContributionIcon
                                            className={styles.icon}
                                            icon={icon}
                                            withoutMarker
                                        />
                                    </span>
                                    <span className={styles.label}>{label[locale]}</span>
                                    <span className={styles.chevron}><FontAwesomeIcon icon={faChevronRight} /></span>
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className={styles.actions}>
                <button type="button" className={styles.toggleOpenButton} onClick={toggleOpen}>
                    <FormattedMessage id={opened ? 'cancel' : 'report'} />
                </button>
            </div>
        </div>
    );
}

ReportLinksButton.propTypes = propTypes;
ReportLinksButton.defaultProps = defaultProps;

export default ReportLinksButton;
