import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useIntl } from 'react-intl';

import { useSetLocale } from '../../contexts/SiteContext';

import styles from '../../styles/partials/locale-selector.module.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

function LocaleSelector({ className }) {
    const intl = useIntl();
    const { locale } = intl;
    const setLocale = useSetLocale();

    return (
        <ul className={classNames([styles.container, { [className]: className !== null }])}>
            {['fr', 'en'].map((l) => (
                <li className={classNames([styles.locale, { [styles.active]: l === locale }])}>
                    <button
                        type="button"
                        onClick={() => {
                            setLocale(l);
                        }}
                    >
                        <span>{l}</span>
                    </button>
                </li>
            ))}
        </ul>
    );
}

LocaleSelector.propTypes = propTypes;
LocaleSelector.defaultProps = defaultProps;

export default LocaleSelector;
