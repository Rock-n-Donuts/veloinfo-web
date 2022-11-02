import { Link } from 'react-router-dom';
import styles from '../../styles/pages/error.module.scss';

function ErrorPage() {
    return (
        <div className={styles.container}>
            <Link to="/">404</Link>
        </div>
    );
}

export default ErrorPage;
