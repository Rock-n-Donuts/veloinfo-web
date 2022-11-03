import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import trashImage from '../../assets/images/trash-can.svg';

import styles from '../../styles/partials/image-upload.module.scss';

const propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    className: null,
    label: null,
    onChange: null,
};

function ImageUpload({ className, label, onChange }) {
    const [blob, setBlob] = useState(null);
    const hasFile = blob !== null;

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

    const onCloseClick = useCallback( () => {
        setBlob(null);
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
            <span className={styles.label}>{label}</span>
            <img className={styles.selectedImage} src={blob} alt="preview" />
            <input type="file" accept="image/*" onChange={onChangePrivate} />
            <button type="button" className={styles.close} onClick={onCloseClick}>
                <img src={trashImage} alt="Remove" />
            </button>
        </label>
    );
}

ImageUpload.propTypes = propTypes;
ImageUpload.defaultProps = defaultProps;

export default ImageUpload;
