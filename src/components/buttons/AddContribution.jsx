import { useCallback, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import {
    useAddUserContribution,
    useCancelUserContributions,
    useUserCurrentContribution,
    useUserUpdateContribution,
} from '../../contexts/SiteContext';
import ContributionIcon from '../../icons/Contribution';
import contributionsTypes from '../../data/contributions-types.json';

import styles from '../../styles/buttons/add-contribution.module.scss';

const propTypes = {
    className: PropTypes.string,
    onNext: PropTypes.func,
};

const defaultProps = {
    className: null,
    onNext: null,
};

function AddContributionButton({ className, onNext }) {
    const { locale } = useIntl();
    const userCurrentContribution = useUserCurrentContribution();
    const opened = userCurrentContribution !== null;
    const { type: userContributionType = null } = userCurrentContribution || {};

    const updateContribution = useUserUpdateContribution();
    const addContribution = useAddUserContribution();
    const cancelContribution = useCancelUserContributions();

    const validTypes = useMemo(
        () => contributionsTypes.filter(({ disableAdd }) => !disableAdd),
        [],
    );

    const onToggleOpen = useCallback(() => {
        if (opened) {
            cancelContribution();
        } else {
            addContribution();
        }
    }, [opened, addContribution, cancelContribution]);

    const updateContributionType = useCallback(
        (type) => {
            updateContribution({ type: userContributionType === type ? null : type });
        },
        [userContributionType, updateContribution],
    );

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                    [styles.opened]: opened,
                    [styles.typeSelected]: userContributionType !== null,
                },
            ])}
        >
            <div className={styles.types}>
                {validTypes.map((contributionType, typeIndex) => {
                    const { id, label, icon, color } = contributionType;
                    const selected = id === userContributionType;
                    return (
                        <div
                            key={`type-${typeIndex}`}
                            className={classNames([styles.type, { [styles.selected]: selected }])}
                        >
                            <div
                                className={styles.typeContent}
                                style={{
                                    transitionDelay: `${
                                        (validTypes.length - 1 - typeIndex) * 0.03
                                    }s`,
                                }}
                            >
                                <button
                                    onClick={() => {
                                        updateContributionType(id);
                                    }}
                                    className={styles.typeButton}
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
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className={styles.actions}>
                <button type="button" className={styles.nextButton} onClick={onNext}>
                    <FormattedMessage id="ok" />
                </button>
                <button type="button" className={styles.toggleOpenButton} onClick={onToggleOpen}>
                    <FormattedMessage id={opened ? 'cancel' : 'add'} />
                </button>
            </div>
        </div>
    );
}

AddContributionButton.propTypes = propTypes;
AddContributionButton.defaultProps = defaultProps;

export default AddContributionButton;
