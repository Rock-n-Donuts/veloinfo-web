import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from '../../styles/forms/contribution.module.scss';
import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

const propTypes = {
    className: PropTypes.string,
    onBack: PropTypes.func,
};

const defaultProps = {
    className: null,
    onBack: null,
};

function ContributionForm({ className, onBack }) {

    const submit = useCallback( () => {
        return false;
    }, []);

    return (
        <form className={classNames([styles.container, { [className]: className !== null }])} onSubmit={submit}>
            <div className={styles.content}>
                
            </div>
            <div className={styles.actions}>
                <button className={styles.backButton} type="button" onClick={() => {onBack()}}>
                    <FormattedMessage id="back" />
                </button>
                <button className={styles.submitButton} type="submit">
                    <FormattedMessage id="publish" />
                </button>
            </div>
        </form>
    );
}

ContributionForm.propTypes = propTypes;
ContributionForm.defaultProps = defaultProps;

export default ContributionForm;
