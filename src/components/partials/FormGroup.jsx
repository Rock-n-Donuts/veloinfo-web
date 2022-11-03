import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from '../../styles/partials/form-group.module.scss';

const propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    children: PropTypes.node,
};

const defaultProps = {
    className: null,
    label: null,
    children: null,
};

function FormGroup({ className, label, children }) {
    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}>
            <div className={styles.label}>{label}</div>
            { children }
        </div>
    );
}

FormGroup.propTypes = propTypes;
FormGroup.defaultProps = defaultProps;

export default FormGroup;
