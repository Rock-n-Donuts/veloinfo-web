import React from 'react';
import PropTypes from 'prop-types';

import getContributionSvg from '../../icons/contributionSvg';
import classNames from 'classnames';

import styles from '../../styles/map/map-marker.module.scss';

const propTypes = {
    className: PropTypes.string,
    icon: PropTypes.string,
    color: PropTypes.string,
    withoutMarker: PropTypes.bool,
    onLoad: PropTypes.func,
};

const defaultProps = {
    className: null,
    icon: null,
    color: null,
    withoutMarker: false,
    onLoad: false,
};

function MapMarker({ className, icon, color, withoutMarker, onLoad, elementRef }) {
    return (
        <img
            className={classNames([styles.container, { [className]: className !== null }])}
            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                getContributionSvg({ icon, color, withoutMarker }),
            )}`}
            ref={elementRef}
            alt="cam"
            onLoad={onLoad}
        />
    );
}

MapMarker.propTypes = propTypes;
MapMarker.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => <MapMarker {...props} elementRef={ref} />);
