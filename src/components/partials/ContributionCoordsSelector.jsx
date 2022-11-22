import { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useUserCurrentContribution } from '../../contexts/SiteContext';
import ContributionIcon from '../../icons/Contribution';
import contributionsTypes from '../../data/contributions-types.json';

import styles from '../../styles/partials/contribution-coords-selector.module.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

function ContributionCoordsSelector({ className }) {
    const userContribution = useUserCurrentContribution();
    const { type = null } = userContribution || {};
    const contributionType = useMemo(
        () => contributionsTypes.find(({ id }) => id === type),
        [type],
    );
    const { icon, color } = contributionType || {};
    return (
        <div className={classNames([styles.container, { [className]: className !== null, [styles.active]: type !== null }])}>
            <div className={styles.mapMarker}>
                <ContributionIcon
                    className={styles.icon}
                    icon={icon}
                    color={color}
                />
            </div>
        </div>
    );
}

ContributionCoordsSelector.propTypes = propTypes;
ContributionCoordsSelector.defaultProps = defaultProps;

export default ContributionCoordsSelector;
