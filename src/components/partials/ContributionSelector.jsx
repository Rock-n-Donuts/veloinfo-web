import { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ContributionIcon from '../../icons/Contribution';
import categories from '../../data/contributions-types.json';
import styles from '../../styles/partials/contribution-selector.module.scss';

const propTypes = {
    className: PropTypes.string,
    selected: PropTypes.shape({}),
    onSelect: PropTypes.func,
    onNext: PropTypes.func,
};

const defaultProps = {
    className: null,
    selected: null,
    onSelect: null,
    onNext: null,
};

function ContributionSelector({ className, selected, onSelect, onNext }) {
    const [categoryIndexSelected, setCategoryIndexSelected] = useState(null);
    const selectedCategory =
        categoryIndexSelected !== null ? categories[categoryIndexSelected] : null;

    const { hidden: categoryHidden, contributions } = selectedCategory || {};

    const { id: selectedId = null } = selected || {};
    const { hidden: finalHidden = categoryHidden } = selected || {};

    const intl = useIntl();
    const { locale } = intl;
    const shortLocale = locale.substring(0, 2);

    const selectCategory = useCallback(
        (categoryIndex) => {
            setCategoryIndexSelected(categoryIndex);
            onSelect(null);
        },
        [setCategoryIndexSelected, onSelect],
    );

    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}>
            <div className={styles.categories}>
                {categories.map(({ label, icon, color }, categoryIndex) => {
                    return (
                        <button
                            key={`category-${categoryIndex}`}
                            className={classNames([
                                styles.category,
                                styles.button,
                                {
                                    [styles.selected]: categoryIndex === categoryIndexSelected,
                                },
                            ])}
                            onClick={() => {
                                selectCategory(categoryIndex);
                            }}
                        >
                            <span
                                className={classNames([
                                    styles.categoryContent,
                                    styles.buttonContent,
                                ])}
                            >
                                <ContributionIcon
                                    className={styles.icon}
                                    icon={icon}
                                    color={color}
                                />
                                <span className={styles.label}>{label[shortLocale]}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
            <div className={styles.selectedCategoryContributions}>
                <div className={styles.contributions}>
                    {(contributions || []).map((contribution, contributionIndex) => {
                        const { label, icon, color, quality } = selectedCategory;
                        const {
                            id,
                            label: finalLabel = label,
                            icon: finalIcon = icon,
                            color: finalColor = color,
                            quality: finalQuality = quality,
                        } = contribution || {};

                        return (
                            <button
                                key={`contribution-${contributionIndex}`}
                                type="button"
                                className={classNames([
                                    styles.contribution,
                                    styles.button,
                                    {
                                        [styles.selected]: id === selectedId,
                                    },
                                ])}
                                onClick={() => {
                                    onSelect({
                                        ...contribution,
                                        label: finalLabel,
                                        icon: finalIcon,
                                        color: finalColor,
                                        quality: finalQuality,
                                    });
                                }}
                            >
                                <span
                                    className={classNames([
                                        styles.contributionContent,
                                        styles.buttonContent,
                                    ])}
                                >
                                    <span className={styles.label}>{finalLabel[shortLocale]}</span>
                                    <ContributionIcon
                                        className={styles.icon}
                                        icon={finalIcon}
                                        color={finalColor}
                                    />
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className={classNames([styles.hiddenWarning, { [styles.active]: finalHidden }])}>
                <FormattedMessage id="contribution-hidden-warning" />
            </div>
            <div className={styles.actions}>
                <button
                    className={styles.nextButton}
                    disabled={selectedId === null}
                    type="button"
                    onClick={() => {
                        onNext();
                    }}
                >
                    <FormattedMessage id="next" />
                </button>
            </div>
        </div>
    );
}

ContributionSelector.propTypes = propTypes;
ContributionSelector.defaultProps = defaultProps;

export default ContributionSelector;
