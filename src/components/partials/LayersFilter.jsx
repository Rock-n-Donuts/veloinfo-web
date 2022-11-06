import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import layersIcon from '../../assets/images/layers.svg';

import styles from '../../styles/partials/layers-filter.module.scss';
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
    const setTroncons = useCallback((days) => {
        // setOpened(false);
    }, []);

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
                    toggle();
                }}
            >
                <img src={layersIcon} alt="Layers" />
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

                    </div>
                </div>
            </div>
        </div>
    );
}

LayersFilter.propTypes = propTypes;
LayersFilter.defaultProps = defaultProps;

export default LayersFilter;
