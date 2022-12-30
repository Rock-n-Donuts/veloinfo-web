import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { GoogleReCaptcha } from 'react-google-recaptcha-v3';

import styles from '../../styles/partials/recaptcha.module.scss';

const propTypes = {
    className: PropTypes.string,
    onVerify: PropTypes.func,
};

const defaultProps = {
    className: null,
    onVerify: undefined,
};

function ReCAPTCHA({ className, onVerify }) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setReady(true);
        }, 250);

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div
            className={classNames([
                styles.container,
                { [className]: className !== null, [styles.ready]: ready },
            ])}
        >
            {ready ? <GoogleReCaptcha onVerify={onVerify} /> : null}
        </div>
    );
}

ReCAPTCHA.propTypes = propTypes;
ReCAPTCHA.defaultProps = defaultProps;

export default ReCAPTCHA;
