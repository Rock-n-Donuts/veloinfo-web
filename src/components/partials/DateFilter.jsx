import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import snowIcon from '../../icons/contributions/snow.svg';

import styles from '../../styles/partials/date-filter.module.scss';
import { FormattedMessage } from 'react-intl';
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

function DateFilter({ className, choices }) {
    const [opened, setOpened] = useState(false);

    const open = useCallback(() => {
        setOpened(true);
    }, [setOpened]);

    const close = useCallback(() => {
        setOpened(false);
    }, [setOpened]);

    const { fromDays, setFromDays } = useFilters();
    const currentChoice = useMemo( () => choices.find(({ days }) => days === fromDays),[choices, fromDays]);
    const { labelKey: currentLabelKey = 'all' } = currentChoice || {};
    const setDateFilter = useCallback(
        (days) => {
            if (days !== null) {
                setFromDays(days);
            } else {
                setFromDays(null);
            }
            setOpened(false);
        },
        [setFromDays, setOpened],
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
                <span className={styles.label}><FormattedMessage id={`date-filter-${currentLabelKey}`} /></span>
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
                            {choices.map(({ labelKey, days }, choiceIndex) => (
                                <button
                                    type="button"
                                    key={`choice-${choiceIndex}`}
                                    className={classNames([{ [styles.selected]: fromDays === days }])}
                                    onClick={() => {
                                        setDateFilter(days);
                                    }}
                                >
                                    <FormattedMessage id={`date-filter-${labelKey}`} />
                                </button>
                            ))}
                            <button
                                type="button"
                                className={classNames([{ [styles.selected]: fromDays === null }])}
                                onClick={() => {
                                    setDateFilter(null);
                                }}
                            >
                                <FormattedMessage id={`date-filter-all`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

DateFilter.propTypes = propTypes;
DateFilter.defaultProps = defaultProps;

export default DateFilter;
