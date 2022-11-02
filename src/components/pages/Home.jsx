import { useCallback } from 'react';
import Map from '../partials/Map';
import MapFilters from '../partials/MapFilters';
import AddContributionButton from '../buttons/AddContribution';

import styles from '../../styles/pages/home.module.scss';

function HomePage() {

    const addContribution = useCallback( () => {
        console.log('add contribution');
    }, []);

    return (
        <div className={styles.container}>
            <MapFilters className={styles.mapFilters} />
            <Map className={styles.map} />
            <AddContributionButton className={styles.addContributionButton} onClick={addContribution} />
        </div>
    );
}

export default HomePage;
