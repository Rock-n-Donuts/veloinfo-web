import { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import CloseButton from '../buttons/Close';
import ContributionForm from '../forms/ContributionForm';

import styles from '../../styles/partials/add-contribution.module.scss';

const propTypes = {
    className: PropTypes.string,
    onClose: PropTypes.func,
    onContributionAdded: PropTypes.func,
    onMinimapMoved: PropTypes.func,
};

const defaultProps = {
    className: null,
    onClose: null,
    onContributionAdded: null,
    onMinimapMoved: null,
};

function AddContributionModal({ className, onClose, onContributionAdded, onMinimapMoved }) {
    const onContributionSubmitted = useCallback(
        (contribution) => {
            if (onContributionAdded !== null) {
                onContributionAdded(contribution);
            }
        },
        [onContributionAdded],
    );

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
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
                    <div className={classNames([styles.page])}>
                        <ContributionForm
                            className={styles.pageContent}
                            onSuccess={onContributionSubmitted}
                            onMinimapMoved={onMinimapMoved}
                        />
                    </div>
                </div>
            </div>
            <CloseButton className={styles.closeButton} onClick={onClose} />
        </div>
    );
}

AddContributionModal.propTypes = propTypes;
AddContributionModal.defaultProps = defaultProps;

export default AddContributionModal;
