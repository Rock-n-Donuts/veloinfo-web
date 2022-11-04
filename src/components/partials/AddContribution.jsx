import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import ContributionTypeSelector from './ContributionTypeSelector';
import CloseButton from '../buttons/Close';
import ContributionForm from '../forms/ContributionForm';
import categories from '../../data/contributions-types.json';

import styles from '../../styles/partials/add-contribution.module.scss';

const propTypes = {
    className: PropTypes.string,
    onClose: PropTypes.func,
    onContributionAdded: PropTypes.func,
};

const defaultProps = {
    className: null,
    onClose: null,
    onContributionAdded: null,
};

function AddContribution({ className, onClose, onContributionAdded }) {
    const [categoryIndexSelected, setCategoryIndexSelected] = useState(null);
    const [contributionTypeSelected, setContributionTypeSelected] = useState(null);
    const [formActive, setFormActive] = useState(false);

    const selectContributionType = useCallback(
        (contributionType) => {
            setContributionTypeSelected(contributionType);
            if (contributionType !== null) {
                setFormActive(true);
            }
        },
        [setContributionTypeSelected, setFormActive],
    );

    const selectCategory = useCallback(
        (categoryIndex) => {
            const category = categories[categoryIndex];
            const { id = null, contributions = null } = category || {};

            if (id !== null && contributions === null) {
                selectContributionType(category);
            } else {
                setCategoryIndexSelected(categoryIndex);
                selectContributionType(null);
            }
        },
        [setCategoryIndexSelected, selectContributionType],
    );

    const hideForm = useCallback(() => {
        setFormActive(false);
        setCategoryIndexSelected(null);
        setTimeout(() => {
            setContributionTypeSelected(null);
        }, 250);
    }, [setFormActive]);

    const onContributionSubmitted = useCallback(
        (contribution) => {
            if (onContributionAdded !== null) {
                setContributionTypeSelected(null);
                onContributionAdded(contribution);
            }
        },
        [setContributionTypeSelected, onContributionAdded],
    );

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                    [styles.formActive]: formActive,
                },
            ])}
        >
            <div className={styles.content}>
                <div className={styles.titleContainer}>
                    <div className={styles.title}>
                        <FormattedMessage id="add-contribution-title" />
                    </div>
                </div>
                <div className={styles.pages}>
                    <div className={classNames([styles.page, styles.contributionTypeSelector])}>
                        <ContributionTypeSelector
                            className={styles.pageContent}
                            categoryIndexSelected={categoryIndexSelected}
                            selected={contributionTypeSelected}
                            onSelect={selectContributionType}
                            onSelectCategory={selectCategory}
                        />
                    </div>
                    <div className={classNames([styles.page, styles.contributionForm])}>
                        <ContributionForm
                            active={formActive}
                            className={styles.pageContent}
                            contributionType={contributionTypeSelected}
                            onBack={hideForm}
                            onSuccess={onContributionSubmitted}
                        />
                    </div>
                </div>
            </div>
            <CloseButton className={styles.closeButton} onClick={onClose} />
        </div>
    );
}

AddContribution.propTypes = propTypes;
AddContribution.defaultProps = defaultProps;

export default AddContribution;
