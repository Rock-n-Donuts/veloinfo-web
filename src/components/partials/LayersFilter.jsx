import { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useFilters } from '../../contexts/FiltersContext';
import ContributionIcon from '../../icons/Contribution';
import contributionsTypes from '../../data/contributions-types.json';
import layersIcon from '../../assets/images/layers.svg';

import styles from '../../styles/partials/layers-filter.module.scss';

const propTypes = {
    className: PropTypes.string,
    tronconTypes: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    className: null,
    tronconTypes: ['winter-protected', 'winter', 'uncleared'],
};

function LayersFilter({ className, tronconTypes }) {
    const intl = useIntl();
    const { locale } = intl;
    const shortLocale = locale.substring(0, 2);
    const {
        contributionTypes: selectedContributionTypes,
        setContributionTypes,
        tronconTypes: selectedTronconTypes,
        setTronconTypes,
    } = useFilters();

    const [opened, setOpened] = useState(false);

    const toggle = useCallback(() => {
        setOpened((old) => !old);
    }, [setOpened]);

    const toggleInArray = useCallback((old, item) => {
        const newTypes = [...old];
        var index = newTypes.findIndex((typeId) => `${typeId}` === `${item}`);

        if (index === -1) {
            newTypes.push(item);
        } else {
            newTypes.splice(index, 1);
        }
        return newTypes;
    }, []);

    const toggleContributionType = useCallback(
        (type) => {
            setContributionTypes((old) => toggleInArray(old, type));
        },
        [setContributionTypes, toggleInArray],
    );

    const toggleTronconType = useCallback(
        (type) => {
            setTronconTypes((old) => toggleInArray(old, type));
        },
        [setTronconTypes, toggleInArray],
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
                <div className={styles.popup}>
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
                        <div className={styles.tronconTypes}>
                            {tronconTypes.map((type, typeIndex) => {
                                const selected = selectedTronconTypes.indexOf(type) > -1;
                                return (
                                    <button
                                        className={classNames([
                                            styles.contributionType,
                                            { [styles.selected]: selected },
                                        ])}
                                        type="button"
                                        key={`type-${typeIndex}`}
                                        onClick={() => {
                                            toggleTronconType(type);
                                        }}
                                    >
                                        <input
                                            className={styles.checkbox}
                                            type="checkbox"
                                            checked={selected}
                                            readOnly
                                        />
                                        <span className={styles.label}>
                                            <FormattedMessage id={`troncon-filter-${type}`} />
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

LayersFilter.propTypes = propTypes;
LayersFilter.defaultProps = defaultProps;

export default LayersFilter;
