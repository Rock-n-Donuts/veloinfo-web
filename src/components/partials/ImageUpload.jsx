import { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { UAParser } from 'ua-parser-js';

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
    const intl = useIntl();
    const [blob, setBlob] = useState(null);
    const hasFile = blob !== null;
    const fileUploadRef = useRef(null);

    const [isChromeAndroid13, setIsChromeAndroid13] = useState(false);
    useEffect(() => {
        new UAParser().getResult().withClientHints().then(function (result) {
            const { browser, os } = result || {};
            const { name: browserName } = browser || {};
            const { name: osName, version: osVersion } = os || {};
            window.alert(browserName + ', ' + osName + ', ' + osVersion + ', ' + (browserName === 'Mobile Chrome' && osName === 'Android' && parseFloat(osVersion) >= 13))
            setIsChromeAndroid13(browserName === 'Mobile Chrome' && osName === 'Android' && parseFloat(osVersion) >= 13);
        });
    }, []);
    

    const onChangePrivate = useCallback(
        (e) => {
            const file = e.target.files[0] || null;
            if (file !== null) {
                if (['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'].indexOf(file.type) > -1) {
                    setBlob(file ? URL.createObjectURL(file) : null);
    
                    if (onChange !== null) {
                        onChange(file);
                    }
                } else {
                    window.alert(intl.formatMessage({ id: 'select-image-only' }));
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
            <input ref={fileUploadRef} type="file" accept={isChromeAndroid13 ? null : 'capture=camera, .heic, .heif, image/jpeg, image/jpg, image/png' } onChange={onChangePrivate} />
            <button type="button" className={styles.close} onClick={onCloseClick}>
                <FontAwesomeIcon icon={faTrash} />
            </button>
        </label>
    );
}

ImageUpload.propTypes = propTypes;
ImageUpload.defaultProps = defaultProps;

export default ImageUpload;
