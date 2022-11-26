import PropTypes from 'prop-types';

import styles from '../../styles/layouts/main.module.scss';

const propTypes = {
    children: PropTypes.node.isRequired,
};

const defaultProps = {
};

function MainLayout({ children }) {
    return (
        <div className={styles.container}>
            <main className={styles.main}>{children}</main>
        </div>
    );
}

MainLayout.propTypes = propTypes;
MainLayout.defaultProps = defaultProps;

export default MainLayout;
