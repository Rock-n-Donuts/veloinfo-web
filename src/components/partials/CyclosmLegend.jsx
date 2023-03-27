import PropTypes from 'prop-types';
import classNames from 'classnames';

import oneWayCycle from '../../assets/images/cyclosm/oneway-cycle.svg';
import bikeRoad from '../../assets/images/cyclosm/bike-road.svg';
import stepsBike from '../../assets/images/cyclosm/steps-bike.svg';

import styles from '../../styles/partials/cyclosm-legend.module.scss';
import { FormattedMessage } from 'react-intl';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

function CyclosmLegend({ className }) {
    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}>
            <div className={styles.row}>
                <span className={classNames([styles.icon, styles.separateCycleway])} />
                <span className={styles.text}>
                    <FormattedMessage id="legend-separate-cycleway" />
                </span>
            </div>
            <div className={styles.row}>
                <span className={classNames([styles.icon, styles.pathBikes])} />
                <span className={styles.text}>
                    <FormattedMessage id="legend-path-bikes" />
                </span>
            </div>
            <div className={styles.row}>
                <span className={classNames([styles.icon, styles.cycleTrack])} />
                <span className={styles.text}>
                    <FormattedMessage id="legend-cycle-track" />
                </span>
            </div>
            <div className={styles.row}>
                <span className={classNames([styles.icon, styles.cycleLane])} />
                <span className={styles.text}>
                    <FormattedMessage id="legend-cycle-lane" />
                </span>
            </div>
            <div className={styles.row}>
                <span className={classNames([styles.icon, styles.sharedLane])} />
                <span className={styles.text}>
                    <FormattedMessage id="legend-shared-lane" />
                </span>
            </div>
            <div className={styles.row}>
                <span className={classNames([styles.icon, styles.doubleWayBikes])}>
                    <img src={oneWayCycle} alt="Double way bikes" />
                </span>
                <span className={styles.text}>
                    <FormattedMessage id="legend-double-way-bikes" />
                </span>
            </div>
            <div className={styles.row}>
                <span className={classNames([styles.icon, styles.bikeRoad])}>
                    <img src={bikeRoad} alt="Bike road" />
                </span>
                <span className={styles.text}>
                    <FormattedMessage id="legend-bike-road" />
                </span>
            </div>
            <div className={styles.row}>
                <span className={classNames([styles.icon, styles.stepsBike])}>
                    <img src={stepsBike} alt="Steps bike" />
                </span>
                <span className={styles.text}>
                    <FormattedMessage id="legend-steps-bike" />
                </span>
            </div>
            <div className={styles.row}>
                <span className={classNames([styles.icon, styles.cycleStreets])} />
                <span className={styles.text}>
                    <FormattedMessage id="legend-cycle-streets" />
                </span>
            </div>
            <div className={styles.note}>
                <FormattedMessage
                    id="cyclosm-note"
                    values={{
                        a: (chunks) => (
                            <a
                                href="https://www.cyclosm.org"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {chunks}
                            </a>
                        ),
                    }}
                />
            </div>
        </div>
    );
}

CyclosmLegend.propTypes = propTypes;
CyclosmLegend.defaultProps = defaultProps;

export default CyclosmLegend;
