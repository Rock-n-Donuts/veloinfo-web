import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import camera from '../../icons/contributions/camera.svg';
import snow from '../../icons/contributions/camera.svg';
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
    useEffect( () => {
        
    }, [icon, color, withoutMarker])
    return (
        <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(
            getContributionSvg({ icon, color, withoutMarker }),
        )}`} ref={elementRef} alt="cam" onLoad={onLoad} />
    );
}

MapMarker.propTypes = propTypes;
MapMarker.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => <MapMarker {...props} elementRef={ref} />);
