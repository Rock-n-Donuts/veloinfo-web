import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReCaptCha from 'react-google-recaptcha';

import styles from '../../styles/partials/recaptcha.module.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

function ReCAPTCHA({ className, captchaRef }) {
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
            {ready ? (
                <ReCaptCha sitekey={process.env.REACT_APP_RECAPTCHA_V2_SITE_KEY} ref={captchaRef} />
            ) : null}
        </div>
    );
}

ReCAPTCHA.propTypes = propTypes;
ReCAPTCHA.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => <ReCAPTCHA {...props} captchaRef={ref} />);
