import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

const propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    url: PropTypes.string,
};

const defaultProps = {
    title: null,
    description: null,
    image: null,
    url: null,
};

function Meta({ title, description, image, url }) {
    return (
        <Helmet>
            {title !== null ? <title>{title}</title> : null }
            {title !== null ? <meta name="og:title" content={title} /> : null }
            {description !== null ?  <meta name="description" content={description} /> : null }
            {description !== null ? <meta name="og:description" content={description} /> : null }
            {image !== null ? <meta name="og:image" content={image} /> : null }
            {url !== null ? <link rel="canonical" href={url} /> : null }
        </Helmet>
    );
}

Meta.propTypes = propTypes;
Meta.defaultProps = defaultProps;

export default Meta;
