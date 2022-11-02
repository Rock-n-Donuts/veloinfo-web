import PropTypes from 'prop-types';
import Footer from '../partials/Footer';
import Header from '../partials/Header';

import styles from '../../styles/layouts/main.module.scss';

const propTypes = {
    children: PropTypes.node.isRequired,
};

const defaultProps = {
};

function MainLayout({ children }) {
    return (
        <div className={styles.container}>
            <Header className={styles.header} />
            <main className={styles.main}>{children}</main>
            <Footer className={styles.footer} />
        </div>
    );
}

MainLayout.propTypes = propTypes;
MainLayout.defaultProps = defaultProps;

export default MainLayout;
