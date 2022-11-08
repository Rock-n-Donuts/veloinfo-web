import PropTypes from 'prop-types';
import classNames from 'classnames';

import CloseIcon from '../../icons/Close';
import styles from '../../styles/buttons/close.module.scss';

const propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func,
    color: PropTypes.string,
};

const defaultProps = {
    className: null,
    onClick: null,
    color: undefined,
};

function CloseButton({ className, onClick, color }) {
    return (
        <button
            type="button"
            className={classNames([styles.container, { [className]: className !== null }])}
            onClick={onClick}
        >
            <CloseIcon color={color} />
        </button>
    );
}

CloseButton.propTypes = propTypes;
CloseButton.defaultProps = defaultProps;

export default CloseButton;
