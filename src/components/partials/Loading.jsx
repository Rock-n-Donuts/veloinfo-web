import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useIntl } from 'react-intl';

import loadingImage from '../../assets/images/loading.svg';
import styles from '../../styles/partials/loading.module.scss';

const propTypes = {
    className: PropTypes.string,
    loading: PropTypes.bool,
};

const defaultProps = {
    className: null,
    loading: false,
};

function Loading({ className, loading }) {
    const intl = useIntl();
    return (
        <div
            className={classNames([
                styles.container,
                { [className]: className !== null, [styles.loading]: loading },
            ])}
        >
            <img
                className={styles.icon}
                src={loadingImage}
                alt={intl.formatMessage({ id: 'loading' })}
            />
        </div>
    );
}

Loading.propTypes = propTypes;
Loading.defaultProps = defaultProps;

export default Loading;
