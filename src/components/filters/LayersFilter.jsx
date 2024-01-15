import { useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useCustomMapLayer,useSetCustomMapLayer, useWinterMode } from '../../contexts/SiteContext';
import { useFilters } from '../../contexts/FiltersContext';
import CyclosmLegend from '../partials/CyclosmLegend';
import ContributionIcon from '../../icons/Contribution';
import contributionTypes from '../../data/contribution-types.json';
import tronconTypes from '../../data/troncon-types.json';
import tronconStates from '../../data/troncon-states.json';
import layersIcon from '../../assets/images/layers.svg';

import styles from '../../styles/filters/layers-filter.module.scss';

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

function LayersFilter({ className, opened, onOpen, onClose }) {
    const { locale } = useIntl();
    const winterMode = useWinterMode();
    const customMapLayer = useCustomMapLayer();
    const setCustomMapLayer = useSetCustomMapLayer();

    const {
        contributionTypes: selectedContributionTypes,
        setContributionTypes,
        tronconTypes: selectedTronconTypes,
        setTronconTypes,
    } = useFilters();

    const toggleInArray = useCallback((old, item) => {
        const newTypes = [...old];
        var index = newTypes.findIndex((typeId) => `${typeId}` === `${item}`);

        if (index === -1) {
            newTypes.push(`${item}`);
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

    const onOpenClick = useCallback(() => {
        if (onOpen !== null) {
            onOpen();
        }
    }, [onOpen]);

    const onCloseClick = useCallback(() => {
        if (onClose !== null) {
            onClose();
        }
    }, [onClose]);

    const onToggleClick = useCallback(() => {
        if (opened) {
            onCloseClick();
        } else {
            onOpenClick();
        }
    }, [opened, onOpenClick, onCloseClick]);

    return (
        <div
            className={classNames([
                styles.container,
                { [className]: className !== null, [styles.opened]: opened },
            ])}
        >
            <button type="button" className={styles.toggler} onClick={onToggleClick}>
                <img src={layersIcon} alt="Layers" />
            </button>
            <div className={styles.popupContainer}>
                <div className={styles.popup}>
                    <div className={styles.content}>
                        <div className={styles.contributionTypes}>
                            {contributionTypes.map(
                                (
                                    {
                                        id,
                                        labelPlural = null,
                                        label: labelSingular = null,
                                        icon,
                                        color,
                                        withoutMarker,
                                    },
                                    typeIndex,
                                ) => {
                                    const finalLabel =
                                        labelPlural !== null ? labelPlural : labelSingular;
                                    const selected =
                                        selectedContributionTypes.indexOf(`${id}`) > -1;
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
                                            <ContributionIcon
                                                className={styles.icon}
                                                icon={icon}
                                                color={color}
                                                withoutMarker={withoutMarker}
                                            />
                                            <span className={styles.label}>
                                                {finalLabel[locale]}
                                            </span>
                                        </button>
                                    );
                                },
                            )}
                        </div>
                        <div className={styles.section}>
                            {winterMode ? (
                                <div className={styles.winterSection}>
                                    <div className={styles.tronconTypes}>
                                        {tronconTypes.map(({ key, label }, typeIndex) => {
                                            const selected = selectedTronconTypes.indexOf(key) > -1;
                                            return (
                                                <button
                                                    className={classNames([
                                                        styles.contributionType,
                                                        { [styles.selected]: selected },
                                                    ])}
                                                    type="button"
                                                    key={`type-${typeIndex}`}
                                                    onClick={() => {
                                                        toggleTronconType(key);
                                                    }}
                                                >
                                                    <input
                                                        className={styles.checkbox}
                                                        type="checkbox"
                                                        checked={selected}
                                                        readOnly
                                                    />
                                                    <span className={styles.label}>
                                                        {label[locale]}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className={styles.tronconsStatus}>
                                        <div className={styles.title}>
                                            <FormattedMessage id="troncons-status-title" />
                                        </div>
                                        <div className={styles.tronconStates}>
                                            {tronconStates.map(({ color, label }, stateIndex) => (
                                                <div
                                                    key={`troncon-state-${stateIndex}`}
                                                    className={styles.tronconState}
                                                >
                                                    <span
                                                        className={styles.line}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                    <span className={styles.label}>
                                                        {label[locale]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className={styles.note}>
                                            <FormattedMessage
                                                id="troncons-status-note"
                                                values={{
                                                    a: (chunks) => (
                                                        <a
                                                            href="https://services.montreal.ca/deneigement/carte"
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            {chunks}
                                                        </a>
                                                    ),
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.summerSection}>
                                    <button
                                        className={classNames([
                                            styles.customMapLayer,
                                            { [styles.selected]: customMapLayer },
                                        ])}
                                        type="button"
                                        onClick={() => {
                                            setCustomMapLayer(!customMapLayer);
                                        }}
                                    >
                                        <input
                                            className={styles.checkbox}
                                            type="checkbox"
                                            checked={!customMapLayer}
                                            readOnly
                                        />
                                        <span className={styles.label}><FormattedMessage id="bike-paths" /></span>
                                    </button>
                                    { !customMapLayer ? 
                                        <CyclosmLegend />
                                    : null }
                                    
                                    
                                </div>
                            )}
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
