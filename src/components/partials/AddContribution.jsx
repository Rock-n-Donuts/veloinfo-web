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

    // i know
    const [transitioningToBack, setTransitioningToBack] = useState(false);
    const [transitioningToNext, setTransitioningToNext] = useState(false);

    const selectContributionType = useCallback(
        (contributionType) => {
            setContributionTypeSelected(contributionType);
        },
        [setContributionTypeSelected],
    );

    const showForm = useCallback(() => {
        setTransitioningToNext(true);
        setTimeout(() => {
            setFormActive(true);
            setTransitioningToNext(false);
        }, 300);
    }, [setFormActive, setTransitioningToNext]);

    const hideForm = useCallback(() => {
        setTransitioningToBack(true);
        setTimeout(() => {
            setFormActive(false);
            setTransitioningToBack(false);
        }, 300);
    }, [setFormActive, setTransitioningToBack]);

    const onContributionSubmitted = useCallback( (contribution) => {
        if (onContributionAdded !== null) {
            setContributionTypeSelected(null);
            onContributionAdded(contribution);
        }        
    }, [setContributionTypeSelected]);

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                    [styles.formActive]: formActive,
                    [styles.transitioningToBack]: transitioningToBack,
                    [styles.transitioningToNext]: transitioningToNext,
                },
            ])}
        >
            <div className={styles.content}>
                <div className={styles.title}>
                    <FormattedMessage id="add-contribution-title" />
                </div>
                <div className={styles.inner}>
                    <ContributionSelector
                        className={styles.contributionSelector}
                        selected={contributionTypeSelected}
                        onSelect={selectContributionType}
                        onNext={showForm}
                    />
                    <ContributionForm
                        active={formActive}
                        className={styles.contributionForm}
                        contributionType={contributionTypeSelected}
                        onBack={hideForm}
                        onSuccess={onContributionSubmitted}
                    />
                </div>
            </div>
            <CloseButton className={styles.closeButton} onClick={onClose} />
        </div>
    );
}

AddContribution.propTypes = propTypes;
AddContribution.defaultProps = defaultProps;

export default AddContribution;
