import { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import styles from '../../styles/partials/image-upload.module.scss';

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
    const [blob, setBlob] = useState(null);
    const hasFile = blob !== null;
    const fileUploadRef = useRef(null);

    const onChangePrivate = useCallback(
        (e) => {
            const file = e.target.files[0] || null;
            setBlob(file ? URL.createObjectURL(file) : null);

            if (onChange !== null) {
                onChange(file);
            }
        },
        [onChange],
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
                accept="capture=camera, image/jpeg, image/jpg, image/png"
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
