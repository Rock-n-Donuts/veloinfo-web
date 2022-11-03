import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from '../../styles/forms/contribution.module.scss';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import ReCAPTCHA from '../partials/ReCAPTCHA';
import FormGroup from '../partials/FormGroup';
import Map from '../partials/Map';
import ContributionIcon from '../../icons/Contribution';

const propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    contributionType: PropTypes.shape({}),
    onBack: PropTypes.func,
};

const defaultProps = {
    active: false,
    className: null,
    contributionType: null,
    onBack: null,
};

function ContributionForm({ active, className, contributionType, onBack }) {
    const { icon: contributionIcon, color: contributionColor } = contributionType || {};

    const captchaRef = useRef();

    const [coords, setCoords] = useState([]);
    const [quality, setQuality] = useState(null);
    const [name, setName] = useState('');
    const [comment, setComment] = useState('');
    const [photo, setPhoto] = useState(null);
    const intl = useIntl();

    const onCenterChanged = useCallback(
        (center) => {
            setCoords(center);
        },
        [setCoords],
    );

    const submit = useCallback(() => {
        const token = captchaRef.current.getValue();
        captchaRef.current.reset();
        return false;
    }, []);

    return (
        <form
            className={classNames([styles.container, { [className]: className !== null }])}
            onSubmit={submit}
        >
            <div className={styles.content}>
                <FormGroup label={intl.formatMessage({ id: 'position-info' })}>
                    <div className={styles.mapContainer}>
                        <Map
                            className={styles.map}
                            onCenterChanged={onCenterChanged}
                            askForPosition={active}
                        />
                        <ContributionIcon
                            className={styles.mapMarker}
                            icon={contributionIcon}
                            color={contributionColor}
                        />
                    </div>
                </FormGroup>
                <ReCAPTCHA ref={captchaRef} />
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
                <button className={styles.submitButton} type="submit">
                    <FormattedMessage id="publish" />
                </button>
            </div>
        </form>
    );
}

ContributionForm.propTypes = propTypes;
ContributionForm.defaultProps = defaultProps;

export default ContributionForm;
