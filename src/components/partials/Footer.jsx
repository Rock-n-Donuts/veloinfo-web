import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from '../../styles/partials/footer.module.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

function Footer({ className }) {
    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}></div>
    );
}

Footer.propTypes = propTypes;
Footer.defaultProps = defaultProps;

export default Footer;
