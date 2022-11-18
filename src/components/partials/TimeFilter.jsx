import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useFilters } from '../../contexts/FiltersContext';
import snowIcon from '../../icons/contributions/snow.svg';
import chevronIcon from '../../assets/images/chevron-bottom.svg';
import choices from '../../data/time-filter-choices.json';

import styles from '../../styles/partials/time-filter.module.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

function TimeFilter({ className }) {
    const { locale } = useIntl();
    const [opened, setOpened] = useState(false);

    const open = useCallback(() => {
        setOpened(true);
    }, [setOpened]);

    const close = useCallback(() => {
        setOpened(false);
    }, [setOpened]);

    const { fromTime, setFromTime } = useFilters();
    const currentChoice = useMemo(
        () => choices.find(({ key }) => key === fromTime) || null,
        [fromTime],
    );
    const { key: currentChoiceKey = null, label: currentChoiceLabel = {} } = currentChoice || {};
    const setDateFilter = useCallback(
        (key) => {
            setFromTime(key);
            setOpened(false);
        },
        [setFromTime, setOpened],
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
                className={styles.dateRangeInner}
                onClick={() => {
                    open();
                }}
            >
                <img src={snowIcon} alt="Snow" />
                <span className={styles.label}>
                    {currentChoice !== null ? (
                        currentChoiceLabel[locale] ? (
                            currentChoiceLabel[locale]
                        ) : (
                            currentChoiceKey
                        )
                    ) : (
                        <FormattedMessage id="time-filter-all" />
                    )}
                </span>
                <img src={chevronIcon} alt="Chevron" />
            </button>
            <button
                type="button"
                onClick={() => {
                    close();
                }}
                className={styles.popupSafe}
            />
            <div className={styles.popupContainer}>
                <div className={styles.popup}>
                    <div className={styles.arrow} />
                    <div className={styles.content}>
                        <div className={styles.choices}>
                            {choices.map(({ key, label = {} }, choiceIndex) => (
                                <button
                                    type="button"
                                    key={`choice-${choiceIndex}`}
                                    className={classNames([
                                        { [styles.selected]: fromTime === key },
                                    ])}
                                    onClick={() => {
                                        setDateFilter(key);
                                    }}
                                >
                                    {label[locale] ? label[locale] : key}
                                </button>
                            ))}
                            <button
                                type="button"
                                className={classNames([{ [styles.selected]: fromTime === null }])}
                                onClick={() => {
                                    setDateFilter(null);
                                }}
                            >
                                <FormattedMessage id="time-filter-all" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

TimeFilter.propTypes = propTypes;
TimeFilter.defaultProps = defaultProps;

export default TimeFilter;
