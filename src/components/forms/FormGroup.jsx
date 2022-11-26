import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from '../../styles/forms/form-group.module.scss';

const propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    fieldset: PropTypes.bool,
    children: PropTypes.node,
};

const defaultProps = {
    className: null,
    label: null,
    fieldset: false,
    children: null,
};

function FormGroup({ className, label, fieldset, children }) {
    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}>
            {fieldset ? (
                <fieldset>
                    <legend>{label}</legend>
                    <div className={styles.fieldsetContent}>{children}</div>
                </fieldset>
            ) : (
                <>
                    {label !== null ? <div className={styles.label}>{label}</div> : null}
                    {children}
                </>
            )}
        </div>
    );
}

FormGroup.propTypes = propTypes;
FormGroup.defaultProps = defaultProps;

export default FormGroup;
