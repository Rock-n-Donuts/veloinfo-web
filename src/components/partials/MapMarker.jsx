import React from 'react';
import PropTypes from 'prop-types';

import getContributionSvg from '../../icons/contributionSvg';

const propTypes = {
    icon: PropTypes.string,
    color: PropTypes.string,
    withoutMarker: PropTypes.bool,
    onLoad: PropTypes.func,
};

const defaultProps = {
    icon: null,
    color: null,
    withoutMarker: false,
    onLoad: false,
};

function MapMarker({ icon, color, withoutMarker, onLoad, elementRef }) {
    return (
        <img
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
