import { useCallback, useState } from 'react';
import Map from '../partials/Map';
import MapHeader from '../partials/MapHeader';
import AddContributionButton from '../buttons/AddContribution';
import AddContribution from '../partials/AddContribution';
import HomeMenu from '../partials/HomeMenu';

import styles from '../../styles/pages/home.module.scss';

function HomePage() {
    const [menuOpened, setMenuOpened] = useState(false);
    const [addContributionOpened, setAddContributionOpened] = useState(false);

    const openMenu = useCallback(() => {
        setMenuOpened(true);
    }, [setMenuOpened]);

    const closeMenu = useCallback(() => {
        setMenuOpened(false);
    }, [setMenuOpened]);

    const openAddContribution = useCallback(() => {
        setAddContributionOpened(true);
    }, [setAddContributionOpened]);

    const closeAddContribution = useCallback(() => {
        setAddContributionOpened(false);
    }, [setAddContributionOpened]);

    return (
        <div className={styles.container}>
            <MapHeader className={styles.mapHeader} onTogglerClick={openMenu} />
            <Map className={styles.map} />
            <AddContributionButton
                className={styles.addContributionButton}
                onClick={openAddContribution}
            />
            <HomeMenu className={styles.homeMenu} opened={menuOpened} onClose={closeMenu} />
            <AddContribution
                className={styles.addContribution}
                opened={addContributionOpened}
                onClose={closeAddContribution}
            />
        </div>
    );
}

export default HomePage;
