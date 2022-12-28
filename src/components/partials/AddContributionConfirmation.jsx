import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage, useIntl } from 'react-intl';
import axios from 'axios';
import Cookies from 'js-cookie';

import {
    useCompleteUserContribution,
    useUserCurrentContribution,
} from '../../contexts/SiteContext';
import ReCAPTCHA from './ReCAPTCHA';
import Loading from './Loading';
import CloseButton from '../buttons/Close';
import contributionTypes from '../../data/contribution-types.json';
import successImage from '../../assets/images/success.svg';

import styles from '../../styles/partials/add-contribution-confirmation.module.scss';

const propTypes = {
    className: PropTypes.string,
    confirmed: PropTypes.bool,
    onClose: PropTypes.func,
    onContributionAdded: PropTypes.func,
};

const defaultProps = {
    className: null,
    confirmed: false,
    onClose: null,
    onContributionAdded: null,
};

function AddContributionConfirmation({ className, confirmed, onClose, onContributionAdded }) {
    const intl = useIntl();
    const onContributionSubmitted = useCallback(
        (contribution) => {
            if (onContributionAdded !== null) {
                onContributionAdded(contribution);
            }
        },
        [onContributionAdded],
    );

    const userCurrentContribution = useUserCurrentContribution();
    const completeUserContribution = useCompleteUserContribution();

    const [captchaToken, setCaptchaToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const hasErrors = errors !== null;
    const [success, setSuccess] = useState(false);

    const submit = useCallback(() => {
        const {
            type = null,
            coords = null,
            quality,
            name = null,
            comment = null,
            photo = null,
        } = userCurrentContribution || {};

        const contributionType = contributionTypes.find(({ id }) => `${id}` === `${type}`);
        const { id: contributionTypeId, qualities: contributionTypeQualities = null } =
            contributionType || {};

        if (coords === null) {
            setErrors(intl.formatMessage({ id: 'error-captcha' }));
            return;
        }

        if ((captchaToken || '').length === 0) {
            setErrors(intl.formatMessage({ id: 'error-captcha' }));
            return;
        }

        setErrors(null);
        setLoading(true);

        const formData = new FormData();
        formData.append('issue_id', contributionTypeId);
        formData.append('coords[]', coords);
        if (
            contributionTypeQualities !== null &&
            quality !== null &&
            parseInt(quality) <= 1 &&
            parseInt(quality) >= -1
        ) {
            formData.append('quality', parseInt(quality, 10));
        }
        if (name !== null && name.length > 0) {
            formData.append('name', name);
        }
        if (comment !== null && comment.length > 0) {
            formData.append('comment', comment);
        }
        if (photo !== null) {
            formData.append('photo', photo);
        }
        formData.append('token', captchaToken);

        // console.log(contributionTypeId, coords, quality, name, comment, photo, captchaToken);

        axios
            .post('/contribution', formData)
            .then((res) => {
                const { data } = res || {};
                const { success = false, contribution = null } = data || {};
                if (success) {
                    if ((name || '').length > 0) {
                        Cookies.set('name', name, { expires: 3650 });
                    }
                    setSuccess(true);
                    setTimeout(() => {
                        completeUserContribution();
                        onContributionSubmitted(contribution);
                    }, 1000);
                } else {
                    setErrors(intl.formatMessage({ id: 'error-server' }));
                }
            })
            .catch((e) => {
                setErrors(intl.formatMessage({ id: 'error-server' }));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [
        captchaToken,
        userCurrentContribution,
        setLoading,
        intl,
        completeUserContribution,
        onContributionSubmitted,
    ]);

    const onCaptchaSuccess = useCallback( (token) => {
        setCaptchaToken(token);
    }, []);

    useEffect( () => {
        if (confirmed && captchaToken !== null) {
            submit();
        }
    }, [captchaToken, confirmed, submit])

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                    [styles.loading]: loading,
                    [styles.success]: success,
                    [styles.hasErrors]: hasErrors,
                },
            ])}
        >
            <div className={styles.content}>
                <div className={styles.captcha}>
                    { confirmed ? <ReCAPTCHA onVerify={onCaptchaSuccess}  /> : null }                        
                </div>
                <div className={styles.errors}>
                    {errors}
                </div>
                <div className={styles.retryLink}>
                    <button type="button" onClick={submit}><FormattedMessage id="retry" /></button>
                </div>
            </div>
            <CloseButton className={styles.closeButton} onClick={onClose} />
            <Loading className={styles.loading} loading={loading} />
            <div className={styles.success}>
                <img src={successImage} alt="Success" />
            </div>
        </div>
    );
}

AddContributionConfirmation.propTypes = propTypes;
AddContributionConfirmation.defaultProps = defaultProps;

export default AddContributionConfirmation;
