import { useCallback, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import axios from 'axios';
import Cookies from 'js-cookie';

import ReCAPTCHA from '../partials/ReCAPTCHA';
import FormGroup from '../partials/FormGroup';

import styles from '../../styles/forms/reply.module.scss';

const propTypes = {
    contributionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    className: PropTypes.string,
    onSuccess: PropTypes.func,
};

const defaultProps = {
    contributionId: null,
    className: null,
    onSuccess: null,
};

function ReplyForm({ contributionId, className, onSuccess }) {
    const intl = useIntl();
    const captchaRef = useRef();
    const nameCookie = Cookies.get('name') || '';
    const [name, setName] = useState(nameCookie);
    const [comment, setComment] = useState('');
    // const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);

    const setNameValue = useCallback((e) => setName(e.target.value), [setName]);
    const setCommentValue = useCallback((e) => setComment(e.target.value), [setComment]);
    // const setPhotoValue = useCallback((file) => setPhoto(file), [setPhoto]);

    const resetForm = useCallback(() => {
        captchaRef.current.reset();
        setName('');
        setComment('');
        // setPhoto(null);
    }, [setName, setComment]);

    const submit = useCallback(
        (e) => {
            e.preventDefault();

            const token = captchaRef.current.getValue();

            if (token.length <= 0) {
                setErrors(intl.formatMessage({ id: 'error-captcha' }));
                return;
            }

            setErrors(null);
            setLoading(true);

            const formData = new FormData();
            if (name.length > 0) {
                formData.append('name', name);
            }
            if (comment.length > 0) {
                formData.append('comment', comment);
            }
            // if (photo !== null) {
            //     formData.append('photo', photo);
            // }

            if (token.length > 0) {
                formData.append('token', token);
            }

            axios
                .post(`/contribution/${contributionId}/reply`, formData)
                .then((res) => {
                    const { data } = res || {};
                    const { success = false, contribution = null } = data || {};
                    if (success && contribution !== null) {
                        Cookies.set('name', name, { expires: 3650 });
                        resetForm();
                        if (onSuccess !== null) {
                            onSuccess(contribution);
                        }
                    } else {
                        console.log(data);
                        setErrors(intl.formatMessage({ id: 'error-server' }));
                    }
                })
                .catch((e) => {
                    console.log(e);
                    setErrors(intl.formatMessage({ id: 'error-server' }));
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        [
            contributionId,
            name,
            comment,
            // photo,
            setLoading,
            onSuccess,
            resetForm,
            intl,
        ],
    );

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                    [styles.loading]: loading,
                },
            ])}
        >
            <form className={styles.form} onSubmit={submit}>
                <div className={styles.content}>
                    {/* {nameCookie.length === 0 ? ( */}
                        <FormGroup className={styles.name}>
                            <input
                                type="text"
                                value={name}
                                placeholder={intl.formatMessage({ id: 'name-placeholder' })}
                                onChange={setNameValue}
                            />
                        </FormGroup>
                    {/* ) : null} */}
                    <FormGroup className={styles.comment}>
                        <textarea
                            required
                            value={comment}
                            placeholder={intl.formatMessage({ id: 'comment-placeholder' })}
                            onChange={setCommentValue}
                        />
                    </FormGroup>
                    {/* <FormGroup className={styles.photo} label={intl.formatMessage({ id: 'photo' })}>
                        <ImageUpload
                            onChange={setPhotoValue}
                            label={intl.formatMessage({ id: 'upload-photo' })}
                        />
                    </FormGroup> */}
                    <div className={styles.captchaContainer}>
                        <div className={styles.captcha}>
                            <ReCAPTCHA ref={captchaRef} />
                        </div>
                    </div>
                    {errors !== null ? <div className={styles.errors}>{errors}</div> : null}
                </div>
                <div className={styles.actions}>
                    <button className={styles.submitButton} type="submit">
                        <FormattedMessage id="publish" />
                    </button>
                </div>
            </form>{' '}
        </div>
    );
}

ReplyForm.propTypes = propTypes;
ReplyForm.defaultProps = defaultProps;

export default ReplyForm;
