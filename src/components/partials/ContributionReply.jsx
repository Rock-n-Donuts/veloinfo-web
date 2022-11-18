import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { getRelativeTime } from '../../lib/utils';

import styles from '../../styles/partials/contribution-reply.module.scss';

const propTypes = {
    className: PropTypes.string,
    date: PropTypes.string,
    name: PropTypes.string,
    message: PropTypes.string,
};

const defaultProps = {
    className: null,
    date: null,
    name: null,
    message: null,
};

function ContributionReply({ className, date, name, message }) {
    const { locale } = useIntl();
    const dateRelativeTime = useMemo( () => getRelativeTime(locale, date), [locale, date])
    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}>
            <div className={styles.replyDate}>
                <span>{dateRelativeTime}</span>
                {name !== null && name.length > 0 ? (
                    <span className={styles.name}> - {name}</span>
                ) : null}
            </div>
            <div className={styles.message}>{message}</div>
        </div>
    );
}

ContributionReply.propTypes = propTypes;
ContributionReply.defaultProps = defaultProps;

export default ContributionReply;
