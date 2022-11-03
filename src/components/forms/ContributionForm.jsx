import { useCallback, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import axios from 'axios';

import ReCAPTCHA from '../partials/ReCAPTCHA';
import FormGroup from '../partials/FormGroup';
import Map from '../partials/Map';
import ContributionIcon from '../../icons/Contribution';

import styles from '../../styles/forms/contribution.module.scss';
import ImageUpload from '../partials/ImageUpload';

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
        quality: contributionTypeQuality,
    } = contributionType || {};

    const intl = useIntl();
    const captchaRef = useRef();

    const [coords, setCoords] = useState(null);
    const [quality, setQuality] = useState(null);
    const [name, setName] = useState('');
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
        setQuality(null);
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
            if (quality !== null && quality <= 1 && quality >= -1) {
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
                                color={contributionTypeColor}
                            />
                        </div>
                    </FormGroup>
                    {contributionTypeQuality ? (
                        <FormGroup
                            className={styles.quality}
                            label={intl.formatMessage({ id: 'pavement-condition' })}
                        >
                            <label>
                                <input
                                    type="radio"
                                    value="1"
                                    name="quality"
                                    onChange={setQualityValue}
                                    checked={quality === 1}
                                    required
                                />
                                <span className={styles.label}>
                                    <FormattedMessage id="positive" />
                                </span>
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="0"
                                    name="quality"
                                    onChange={setQualityValue}
                                    checked={quality === 0}
                                />
                                <span className={styles.label}>
                                    <FormattedMessage id="neutral" />
                                </span>
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="-1"
                                    name="quality"
                                    onChange={setQualityValue}
                                    checked={quality === -1}
                                />
                                <span className={styles.label}>
                                    <FormattedMessage id="negative" />
                                </span>
                            </label>
                        </FormGroup>
                    ) : null}
                    <FormGroup className={styles.name} label={intl.formatMessage({ id: 'name' })}>
                        <input type="text" value={name} onChange={setNameValue} />
                    </FormGroup>
                    <FormGroup
                        className={styles.comment}
                        label={intl.formatMessage({ id: 'comment' })}
                    >
                        <textarea value={comment} onChange={setCommentValue} />
                    </FormGroup>
                    <FormGroup className={styles.photo} label={intl.formatMessage({ id: 'photo' })}>
                        <ImageUpload onChange={setPhotoValue} label={intl.formatMessage({ id: 'upload-photo'})} />
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
        </div>
    );
}

ContributionForm.propTypes = propTypes;
ContributionForm.defaultProps = defaultProps;

export default ContributionForm;
