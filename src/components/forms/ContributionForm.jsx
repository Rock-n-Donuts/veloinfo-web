import { useCallback, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';

import {
    useCompleteUserContribution,
    useUserCurrentContribution,
    useUserUpdateContribution,
} from '../../contexts/SiteContext';
import ReCAPTCHA from '../partials/ReCAPTCHA';
import FormGroup from '../partials/FormGroup';
import ImageUpload from '../partials/ImageUpload';
import Map from '../partials/Map';
import ContributionIcon from '../../icons/Contribution';
import successImage from '../../assets/images/success.svg';
import contributionsTypes from '../../data/contributions-types.json';

import styles from '../../styles/forms/contribution.module.scss';

const propTypes = {
    className: PropTypes.string,
    onBack: PropTypes.func,
    onSuccess: PropTypes.func,
    onMinimapMoved: PropTypes.func,
};

const defaultProps = {
    className: null,
    onBack: null,
    onSuccess: null,
    onMinimapMoved: null,
};

function ContributionForm({ className, onBack, onSuccess, onMinimapMoved }) {
    const intl = useIntl();
    const { locale } = intl;
    const captchaRef = useRef();

    const userCurrentContribution = useUserCurrentContribution();
    const updateContribution = useUserUpdateContribution();
    const completeUserContribution = useCompleteUserContribution();
    const [minimapEnabled, setMinimapEnabled] = useState(false);

    const {
        type = null,
        coords = null,
        quality,
        name = '',
        comment = '',
        photo = null,
    } = userCurrentContribution || {};

    const contributionType = useMemo(
        () => contributionsTypes.find(({ id }) => `${id}` === `${type}`),
        [type],
    );
    const {
        id: contributionTypeId,
        icon: contributionTypeIcon,
        color: contributionTypeColor,
        qualities: contributionTypeQualities = null,
    } = contributionType || {};

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const [success, setSuccess] = useState(false);

    const toggleMinimapEnable = useCallback(() => setMinimapEnabled((old) => !old), []);

    const setQualityValue = useCallback(
        (e) => updateContribution({ quality: parseInt(e.target.value) }),
        [updateContribution],
    );
    const setNameValue = useCallback(
        (e) => updateContribution({ name: e.target.value }),
        [updateContribution],
    );
    const setCommentValue = useCallback(
        (e) => updateContribution({ comment: e.target.value }),
        [updateContribution],
    );
    const setPhotoValue = useCallback(
        (photo) => updateContribution({ photo }),
        [updateContribution],
    );

    const resetForm = useCallback(() => {
        captchaRef.current.reset();
        completeUserContribution();
    }, [completeUserContribution]);

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
                    [styles.minimapEnabled]: minimapEnabled,
                },
            ])}
        >
            <form className={styles.form} onSubmit={submit}>
                <div className={styles.content}>
                    <FormGroup className={styles.mapContainer} label={intl.formatMessage({ id: 'position-info'})}>
                        <div className={styles.mapContent}>
                            <Map
                                className={styles.map}
                                mapCenter={coords}
                                zoom={18}
                                onMoveEnded={onMinimapMoved}
                            />
                            <div className={styles.mapMarker}>
                                <ContributionIcon
                                    className={styles.icon}
                                    icon={contributionTypeIcon}
                                    color={iconColor}
                                />
                            </div>
                            <button className={styles.toggleMinimapEnable} type="button" onClick={toggleMinimapEnable}>
                                <FontAwesomeIcon icon={minimapEnabled ? faUnlock : faLock } />
                            </button>
                        </div>
                    </FormGroup>
                    {contributionTypeQualities !== null ? (
                        <FormGroup
                            className={styles.quality}
                            label={intl.formatMessage({ id: 'quality' })}
                        >
                            <div className={styles.qualities}>
                                {contributionTypeQualities.map(
                                    ({ value, label, color }, qualityIndex) => (
                                        <label key={`quality-${qualityIndex}`}>
                                            <input
                                                type="radio"
                                                value={value}
                                                name="quality"
                                                onChange={setQualityValue}
                                                checked={quality === value}
                                                required
                                            />
                                            <span
                                                className={styles.bullet}
                                                style={{ backgroundColor: color }}
                                            />
                                            <span className={styles.label}>{label[locale]}</span>
                                        </label>
                                    ),
                                )}
                            </div>
                        </FormGroup>
                    ) : null}
                    <FormGroup className={styles.name} label={intl.formatMessage({ id: 'name' })}>
                        <input
                            type="text"
                            value={name}
                            placeholder={intl.formatMessage({ id: 'name-placeholder' })}
                            onChange={setNameValue}
                        />
                    </FormGroup>
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
