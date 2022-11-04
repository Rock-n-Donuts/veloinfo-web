import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ContributionIcon from '../../icons/Contribution';
import categories from '../../data/contributions-types.json';
import styles from '../../styles/partials/contribution-type-selector.module.scss';

const propTypes = {
    className: PropTypes.string,
    categoryIndexSelected: PropTypes.number,
    selected: PropTypes.shape({}),
    onSelect: PropTypes.func,
    onSelectCategory: PropTypes.func,
};

const defaultProps = {
    className: null,
    categoryIndexSelected: null,
    selected: null,
    onSelect: null,
    onSelectCategory: null,
};

function ContributionTypeSelector({
    className,
    selected,
    categoryIndexSelected,
    onSelect,
    onSelectCategory,
}) {
    const selectedCategory =
        categoryIndexSelected !== null ? categories[categoryIndexSelected] : null;

    const { contributions } = selectedCategory || {};

    const { id: selectedId = null } = selected || {};

    const intl = useIntl();
    const { locale } = intl;
    const shortLocale = locale.substring(0, 2);

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
                                onSelectCategory(categoryIndex);
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
                                <span className={styles.labelContainer}>
                                    <span className={styles.label}>{label[shortLocale]}</span>
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>
            <div className={styles.selectedCategoryContributions}>
                <div className={styles.contributions}>
                    {(contributions || []).map((contribution, contributionIndex) => {
                        const { label, icon, color, qualities } = selectedCategory;
                        const {
                            id,
                            label: finalLabel = label,
                            icon: finalIcon = icon,
                            color: finalColor = color,
                            qualities: finalQualities = qualities,
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
                                        qualities: finalQualities,
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
        </div>
    );
}

ContributionTypeSelector.propTypes = propTypes;
ContributionTypeSelector.defaultProps = defaultProps;

export default ContributionTypeSelector;
