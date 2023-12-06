import { useCallback, useMemo, useRef, useState } from 'react';
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

    const isChromeAndroid13 = useMemo( () => {
        const parser = new UAParser() || null;
        const browser = parser !== null ? parser.getBrowser() : null;
        const { name: browserName } = browser || {};
        const os = parser !== null ? parser.getOS() : null;
        const { name: osName, version: osVersion } = os || {};
        const isIt = browserName === 'Mobile Chrome' && osName === 'Android' && parseInt(osVersion) === 13;
        window.alert(isIt + ', ' + browserName + ', ' + osName + ', ' + osVersion + ', ' + typeof osVersion);
        return isIt;
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
