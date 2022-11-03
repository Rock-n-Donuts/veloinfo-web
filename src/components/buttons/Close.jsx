import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useIntl } from 'react-intl';

import closeIcon from '../../assets/images/close-icon.svg';

import styles from '../../styles/buttons/close.module.scss';

const propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func,
};

const defaultProps = {
    className: null,
    onClick: null,
};

function CloseButton({ className, onClick }) {
    const intl = useIntl();
    return (
        <button
            type="button"
            className={classNames([styles.container, { [className]: className !== null }])}
            onClick={onClick}
        >
            <img
                src={closeIcon}
                alt={intl.formatMessage({
                    id: 'close'
                })}
            />
        </button>
    );
}

CloseButton.propTypes = propTypes;
CloseButton.defaultProps = defaultProps;

export default CloseButton;
