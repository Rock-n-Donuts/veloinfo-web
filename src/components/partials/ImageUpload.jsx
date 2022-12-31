import { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import styles from '../../styles/partials/image-upload.module.scss';
import { isDeviceMobile } from '../../lib/utils';
import { useIntl } from 'react-intl';

const propTypes = {
    className: PropTypes.string,
    onChange: PropTypes.func,
    children: PropTypes.node,
};

const defaultProps = {
    className: null,
    onChange: null,
    children: null,
};

function ImageUpload({ className, onChange, children }) {
    const intl = useIntl();
    const isMobile = useMemo(() => isDeviceMobile(), []);
    const [blob, setBlob] = useState(null);
    const hasFile = blob !== null;
    const fileUploadRef = useRef(null);

    const onChangePrivate = useCallback(
        (e) => {
            const file = e.target.files[0] || null;
            if (['image/jpeg', 'image/jpg', 'image/png', 'image/heic'].indexOf(file.type) === -1) {
                window.alert(intl.formatMessage({ id: 'select-image-only' }));
            } else {
                setBlob(file ? URL.createObjectURL(file) : null);

                if (onChange !== null) {
                    onChange(file);
                }
            }
        },
        [onChange, intl],
    );

    const onCloseClick = useCallback(() => {
        setBlob(null);
        fileUploadRef.current.value = '';
        if (onChange !== null) {
            onChange(null);
        }
    }, [setBlob, onChange]);

    return (
        <label
            className={classNames([
                styles.container,
                { [className]: className !== null, [styles.hasFile]: hasFile },
            ])}
        >
            <div className={styles.content}>{children}</div>
            <img className={styles.selectedImage} src={blob} alt="preview" />
            <input
                ref={fileUploadRef}
                type="file"
                accept={isMobile ? 'capture=camera' : 'image/jpeg, image/png, capture=camera'}
                onChange={onChangePrivate}
            />
            <button type="button" className={styles.close} onClick={onCloseClick}>
                <FontAwesomeIcon icon={faTrash} />
            </button>
        </label>
    );
}

ImageUpload.propTypes = propTypes;
ImageUpload.defaultProps = defaultProps;

export default ImageUpload;
