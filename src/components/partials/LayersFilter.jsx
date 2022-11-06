import { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ContributionIcon from '../../icons/Contribution';
import contributionsTypes from '../../data/contributions-types.json';

import layersIcon from '../../assets/images/layers.svg';

import styles from '../../styles/partials/layers-filter.module.scss';
import { useFilters } from '../../contexts/FiltersContext';
const propTypes = {
    className: PropTypes.string,
    choices: PropTypes.arrayOf(
        PropTypes.shape({
            labelKey: PropTypes.string,
            days: PropTypes.number,
        }),
    ),
};

const defaultProps = {
    className: null,
    choices: [
        {
            labelKey: '1day',
            days: 1,
        },
        {
            labelKey: '2days',
            days: 2,
        },
        {
            labelKey: '3days',
            days: 3,
        },
        {
            labelKey: '5days',
            days: 5,
        },
        {
            labelKey: '7days',
            days: 7,
        },
        {
            labelKey: '14days',
            days: 14,
        },
        {
            labelKey: '30days',
            days: 30,
        },
    ],
};

function LayersFilter({ className, choices }) {
    const intl = useIntl();
    const { locale } = intl;
    const shortLocale = locale.substring(0, 2);
    const { contributionTypes: selectedContributionTypes, setContributionTypes } = useFilters();

    const [opened, setOpened] = useState(false);

    // const open = useCallback(() => {
    //     setOpened(true);
    // }, [setOpened]);

    const close = useCallback(() => {
        setOpened(false);
    }, [setOpened]);

    const toggle = useCallback(() => {
        setOpened((old) => !old);
    }, [setOpened]);

    // const currentChoice = useMemo( () => choices.find(({ days }) => days === fromDays),[choices, fromDays]);
    // const { labelKey: currentLabelKey = 'all' } = currentChoice || {};
    const toggleContributionType = useCallback(
        (type) => {
            setContributionTypes((old) => {
                const newTypes = [...old];
                var index = newTypes.findIndex((typeId) => parseInt(typeId) === parseInt(type));

                if (index === -1) {
                    newTypes.push(type);
                } else {
                    newTypes.splice(index, 1);
                }
                return newTypes;
            });
        },
        [setContributionTypes],
    );

    return (
        <div
            className={classNames([
                styles.container,
                { [className]: className !== null, [styles.opened]: opened },
            ])}
        >
            <button
                type="button"
                className={styles.toggler}
                onClick={() => {
                    toggle();
                }}
            >
                <img src={layersIcon} alt="Layers" />
            </button>
            <div className={styles.popupContainer}>
                <div className={styles.content}>
                    <div className={styles.contributionTypes}>
                        {contributionsTypes.map(({ id, label, icon, color }, typeIndex) => {
                            const selected = selectedContributionTypes.indexOf(id) > -1;
                            return (
                                <button
                                    className={classNames([
                                        styles.contributionType,
                                        { [styles.selected]: selected },
                                    ])}
                                    type="button"
                                    key={`type-${typeIndex}`}
                                    onClick={() => {
                                        toggleContributionType(id);
                                    }}
                                >
                                    <input
                                        className={styles.checkbox}
                                        type="checkbox"
                                        checked={selected}
                                        readOnly
                                    />
                                    <span className={styles.label}>{label[shortLocale]}</span>
                                    <ContributionIcon
                                        className={styles.icon}
                                        icon={icon}
                                        color={color}
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

LayersFilter.propTypes = propTypes;
LayersFilter.defaultProps = defaultProps;

export default LayersFilter;
