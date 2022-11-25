import { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useUserCurrentContribution } from '../../contexts/SiteContext';
import ContributionIcon from '../../icons/Contribution';
import contributionTypes from '../../data/contribution-types.json';

import styles from '../../styles/partials/contribution-coords-selector.module.scss';

const propTypes = {
    className: PropTypes.string,
    opened: PropTypes.bool,
};

const defaultProps = {
    className: null,
    opened: false,
};

function ContributionCoordsSelector({ className, opened }) {
    const userContribution = useUserCurrentContribution();
    const { type = null } = userContribution || {};
    const hasType = type !== null;
    const contributionType = useMemo(() => contributionTypes.find(({ id }) => id === type), [type]);
    const { icon, color } = contributionType || {};
    return (
        <div
            className={classNames([
                styles.container,
                { [className]: className !== null, [styles.active]: opened && hasType },
            ])}
        >
            <div className={styles.mapMarker}>
                <ContributionIcon className={styles.icon} icon={icon} color={color} />
            </div>
        </div>
    );
}

ContributionCoordsSelector.propTypes = propTypes;
ContributionCoordsSelector.defaultProps = defaultProps;

export default ContributionCoordsSelector;
