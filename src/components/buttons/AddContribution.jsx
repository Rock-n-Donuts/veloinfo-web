import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useIntl } from 'react-intl';

import addContributionImage from '../../assets/images/add-contribution.svg';

import styles from '../../styles/buttons/add-contribution.module.scss';

const propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func,
};

const defaultProps = {
    className: null,
    onClick: null,
};

function AddContributionButton({ className, onClick }) {
    const intl = useIntl();
    return (
        <button
            type="button"
            className={classNames([styles.container, { [className]: className !== null }])}
            onClick={onClick}
        >
            <img
                src={addContributionImage}
                alt={intl.formatMessage({
                    id: 'add-contribution',
                    defaultMessage: 'Add contribution',
                })}
            />
        </button>
    );
}

AddContributionButton.propTypes = propTypes;
AddContributionButton.defaultProps = defaultProps;

export default AddContributionButton;
