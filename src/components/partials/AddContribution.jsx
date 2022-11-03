import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import ContributionSelector from './ContributionSelector';
import CloseButton from '../buttons/Close';
import ContributionForm from '../forms/ContributionForm';
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
    const [contributionTypeSelected, setContributionTypeSelected] = useState(null);
    const [formActive, setFormActive] = useState(false);

    const selectContributionType = useCallback(
        (contributionType) => {
            setContributionTypeSelected(contributionType);
        },
        [setContributionTypeSelected],
    );

    const showForm = useCallback(() => {
        setFormActive(true);
    }, [setFormActive]);

    const hideForm = useCallback(() => {
        setFormActive(false);
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
                <div className={styles.title}>
                    <FormattedMessage id="add-contribution-title" />
                </div>
                <div className={styles.pages}>
                    <div className={classNames([styles.page, styles.contributionSelector])}>
                        <ContributionSelector
                            className={styles.pageContent}
                            selected={contributionTypeSelected}
                            onSelect={selectContributionType}
                            onNext={showForm}
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
