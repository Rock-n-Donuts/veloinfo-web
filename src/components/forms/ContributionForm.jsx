import { useCallback, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import axios from 'axios';
import Cookies from 'js-cookie';

import ReCAPTCHA from '../partials/ReCAPTCHA';
import FormGroup from '../partials/FormGroup';
import ImageUpload from '../partials/ImageUpload';
import Map from '../partials/Map';
import ContributionIcon from '../../icons/Contribution';

import successImage from '../../assets/images/success.svg';

import styles from '../../styles/forms/contribution.module.scss';

const propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    contributionType: PropTypes.shape({}),
    onBack: PropTypes.func,
    onSuccess: PropTypes.func,
};

const defaultProps = {
    active: false,
    className: null,
    contributionType: null,
    onBack: null,
    onSuccess: null,
};

function ContributionForm({ active, className, contributionType, onBack, onSuccess }) {
    const {
        id: contributionTypeId,
        icon: contributionTypeIcon,
        color: contributionTypeColor,
        qualities: contributionTypeQualities = null,
    } = contributionType || {};

    const intl = useIntl();
    const { locale } = intl;
    const shortLocale = locale.substring(0, 2);
    const captchaRef = useRef();

    const nameCookie = Cookies.get('name') || '';
    const [coords, setCoords] = useState(null);
    const [quality, setQuality] = useState(0);
    const [name, setName] = useState(nameCookie);
    const [comment, setComment] = useState('');
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const [success, setSuccess] = useState(false);
    const [positionRefused, setPositionRefused] = useState(false);

    const setCoordsValue = useCallback((center) => setCoords(center), [setCoords]);
    const setQualityValue = useCallback((e) => setQuality(parseInt(e.target.value)), [setQuality]);
    const setNameValue = useCallback((e) => setName(e.target.value), [setName]);
    const setCommentValue = useCallback((e) => setComment(e.target.value), [setComment]);
    const setPhotoValue = useCallback((file) => setPhoto(file), [setPhoto]);

    const resetForm = useCallback(() => {
        captchaRef.current.reset();
        setQuality(0);
        setName('');
        setComment('');
        setPhoto(null);
    }, [setQuality, setName, setComment, setPhoto]);

    const onPositionRefused = useCallback(() => {
        setPositionRefused(true);
    }, [setPositionRefused]);

    const submit = useCallback(
        (e) => {
            e.preventDefault();

            if (coords === null) {
                setErrors(intl.formatMessage({ id: 'error-captcha' }));
                return;
            }

            const token = captchaRef.current.getValue();

            if (token.length <= 0) {
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
                quality <= 1 &&
                quality >= -1
            ) {
                formData.append('quality', quality);
            }
            if (name.length > 0) {
                formData.append('name', name);
            }
            if (comment.length > 0) {
                formData.append('comment', comment);
            }
            if (photo !== null) {
                formData.append('photo', photo);
            }
            if (token.length > 0) {
                formData.append('token', token);
            }

            axios
                .post('/contribution', formData)
                .then((res) => {
                    const { data } = res || {};
                    const { success = false, contribution = null } = data || {};
                    if (success) {
                        Cookies.set('name', name, { expires: 3650 });
                        setSuccess(true);
                        setTimeout(() => {
                            resetForm();
                            if (onSuccess !== null) {
                                onSuccess(contribution);
                            }
                        }, 1000);
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
            contributionTypeId,
            contributionTypeQualities,
            coords,
            quality,
            name,
            comment,
            photo,
            setLoading,
            onSuccess,
            resetForm,
            intl,
        ],
    );

    const currentQuality =
        contributionTypeQualities !== null
            ? contributionTypeQualities.find(({ value }) => parseInt(value) === parseInt(quality))
            : null;
    const { color: iconColor = contributionTypeColor } = currentQuality || {};

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                    [styles.loading]: loading,
                    [styles.success]: success,
                    [styles.showMarker]: positionRefused || coords !== null,
                },
            ])}
        >
            <form className={styles.form} onSubmit={submit}>
                <div className={styles.content}>
                    <FormGroup
                        className={styles.mapContainer}
                        label={intl.formatMessage({ id: 'position-info' })}
                    >
                        <Map
                            className={styles.map}
                            onCenterChanged={setCoordsValue}
                            askForPosition={active}
                            onPositionRefused={onPositionRefused}
                        />
                        <div className={styles.mapMarker}>
                            <ContributionIcon
                                className={styles.icon}
                                icon={contributionTypeIcon}
                                color={iconColor}
                            />
                        </div>
                    </FormGroup>
                    {contributionTypeQualities !== null ? (
                        <FormGroup
                            className={styles.quality}
                            label={intl.formatMessage({ id: 'pavement-condition' })}
                        >
                            {contributionTypeQualities.map(({ value, label }, qualityIndex) => (
                                <label key={`quality-${qualityIndex}`}>
                                    <input
                                        type="radio"
                                        value={value}
                                        name="quality"
                                        onChange={setQualityValue}
                                        checked={quality === value}
                                        required
                                    />
                                    <span className={styles.label}>{label[shortLocale]}</span>
                                </label>
                            ))}
                        </FormGroup>
                    ) : null}
                    {nameCookie.length === 0 ? (
                        <FormGroup
                            className={styles.name}
                            label={intl.formatMessage({ id: 'name' })}
                        >
                            <input
                                type="text"
                                value={name}
                                placeholder={intl.formatMessage({ id: 'name-placeholder' })}
                                onChange={setNameValue}
                            />
                        </FormGroup>
                    ) : null}
                    <FormGroup
                        className={styles.comment}
                        label={intl.formatMessage({ id: 'comment' })}
                    >
                        <textarea
                            value={comment}
                            placeholder={intl.formatMessage({ id: 'comment-placeholder' })}
                            onChange={setCommentValue}
                        />
                    </FormGroup>
                    <FormGroup className={styles.photo} label={intl.formatMessage({ id: 'photo' })}>
                        <ImageUpload
                            onChange={setPhotoValue}
                            label={intl.formatMessage({ id: 'upload-photo' })}
                        />
                    </FormGroup>
                    <div className={styles.captchaContainer}>
                        <div className={styles.captcha}>
                            <ReCAPTCHA ref={captchaRef} />
                        </div>
                    </div>
                    <div className={styles.errors}>{errors}</div>
                </div>
                <div className={styles.actions}>
                    <button
                        className={styles.backButton}
                        type="button"
                        onClick={() => {
                            onBack();
                        }}
                    >
                        <FormattedMessage id="back" />
                    </button>
                    <button
                        className={styles.submitButton}
                        type="submit"
                        disabled={coords === null}
                    >
                        <FormattedMessage id="publish" />
                    </button>
                </div>
            </form>
            <div className={styles.success}>
                <img src={successImage} alt="Success" />
            </div>
        </div>
    );
}

ContributionForm.propTypes = propTypes;
ContributionForm.defaultProps = defaultProps;

export default ContributionForm;
