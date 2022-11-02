import Map from '../partials/Map';
import MapFilters from '../partials/MapFilters';

import styles from '../../styles/pages/home.module.scss';

function HomePage() {
    return (
        <div className={styles.container}>
            <MapFilters className={styles.mapFilters} />
            <Map className={styles.map} />
        </div>
    );
}

export default HomePage;
