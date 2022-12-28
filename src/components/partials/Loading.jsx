import PropTypes from 'prop-types';
import classNames from 'classnames';

import LoadingIcon from '../../icons/Loading';

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
    return (
        <div
            className={classNames([
                styles.container,
                { [className]: className !== null, [styles.loading]: loading },
            ])}
        >
            <LoadingIcon
                className={styles.icon}
            />
        </div>
    );
}

Loading.propTypes = propTypes;
Loading.defaultProps = defaultProps;

export default Loading;
