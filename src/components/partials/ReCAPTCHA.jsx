import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { GoogleReCaptchaProvider, GoogleReCaptcha } from 'react-google-recaptcha-v3';

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
            <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_V3_SITE_KEY}>
            {ready ? (
                <GoogleReCaptcha onVerify={onVerify} />
            ) : null}
            </GoogleReCaptchaProvider>
        </div>
    );
}

ReCAPTCHA.propTypes = propTypes;
ReCAPTCHA.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => <ReCAPTCHA {...props} captchaRef={ref} />);
