import React from 'react';
import ReCaptCha from 'react-google-recaptcha';

function ReCAPTCHA({ captchaRef }) {
    return <ReCaptCha sitekey={process.env.REACT_APP_RECAPTCHA_V2_SITE_KEY} ref={captchaRef} />;
}

export default React.forwardRef((props, ref) => <ReCAPTCHA {...props} captchaRef={ref} />);
