import PropTypes from 'prop-types';
import classNames from 'classnames';
import CloseButton from '../buttons/Close';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import CommentsIcon from '../../icons/Comments';
import usePrevious from '../../hooks/usePrevious';
import { getRelativeTime } from '../../lib/utils';
import ReplyForm from '../forms/ReplyForm';

import contributionsTypes from '../../data/contributions-types.json';
import styles from '../../styles/partials/contribution-details.module.scss';

const propTypes = {
    className: PropTypes.string,
    contribution: PropTypes.shape({}),
    children: PropTypes.node,
    onClose: PropTypes.func,
};

const defaultProps = {
    className: null,
    contribution: null,
    children: null,
    onClose: null,
};

function ContributionDetails({ className, contribution, children, onClose }) {
    const previousContribution = usePrevious(contribution) || null;
    const finalContribution = contribution || previousContribution;

    const {
        // last_vote,// contient le dernier score pour indiquer l'état et couleur gris
        id,
        issue_id,
        quality,
        comment,
        created_at,
        name = null,
        photo_path = null,
        replies = [],
        score,
        updated_at,
    } = finalContribution || {};

    const intl = useIntl();
    const { locale } = intl;
    const shortLocale = locale.substring(0, 2);

    const contributionType = contributionsTypes.reduce((prev, ct) => {
        if (prev !== null) {
            return prev;
        }
        const { id, contributions = null } = ct;

        if (parseInt(id) === parseInt(issue_id)) {
            return ct;
        } else if (contributions !== null) {
            return contributions.find(({ id: cid }) => cid === issue_id);
        } else {
            return null;
        }
    }, null);

    const {
        label: contributionTypeLabel,
        votes: contributionTypeVotes,
        qualities: contributionTypeQualities = null,
    } = contributionType || {};
    const contributionTypeQuality =
        contributionTypeQualities !== null
            ? contributionTypeQualities.find(({ value }) => parseInt(value) === parseInt(quality))
            : null;

    const { label: contributionTypeQualityLabel = null } = contributionTypeQuality || {};
    const { positive: contributionTypePositive = null, negative: contributionTypeNegative = null } =
        contributionTypeVotes || {};
    const { label: positiveVoteLabel = null, color: positiveVoteColor = null } =
        contributionTypePositive || {};
    const { label: negativeVoteLabel = null, color: negativeVoteColor = null } =
        contributionTypeNegative || {};

    const { positive = 0, negative = 0 } = score || {};
    // const totalVote = positive + negative;

    const [canVote, setCanVote] = useState(false);
    const [voteLoading, setVoteLoading] = useState(false);

    const vote = useCallback(
        (score) => {
            setVoteLoading(true);
            axios
                .post(`/contribution/${id}/vote`, { score })
                .then((res) => {
                    const { data } = res || {};
                    const { success = false } = data || {};
                    if (success) {
                        //@TODO refresh data
                        setCanVote(false);
                    } else {
                        console.log(data);
                    }
                })
                .catch((e) => {
                    console.log(e);
                })
                .finally(() => {
                    setVoteLoading(false);
                });
        },
        [id, setCanVote, setVoteLoading],
    );

    const onVotePositive = useCallback(() => {
        vote(1);
    }, [vote]);
    const onVoteNegative = useCallback(() => {
        vote(-1);
    }, [vote]);
    
    useEffect( () => {
        axios.get(`/contribution/${id}`)
            .then((res) => {
                const { data } = res || {};
                const { can_vote = false } = data || {};
                if (can_vote) {
                    setCanVote(true);
                }
            })
    }, [id]);

    const onReplySuccess = useCallback( () => {

        //@TODO refresh data
    }, []);

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                    [styles.voteDisabled]: !canVote || voteLoading,
                },
            ])}
        >
            {finalContribution !== null ? (
                <div className={styles.content}>
                    <div className={styles.contributionType}>
                        <span>{contributionTypeLabel[shortLocale]}</span>
                        {contributionTypeQualityLabel !== null ? (
                            <span> - {contributionTypeQualityLabel[shortLocale]}</span>
                        ) : null}
                    </div>
                    <div className={styles.dates}>
                        <div className={styles.createdDate}>
                            <span>Signalé</span>
                            <span> : </span>
                            {getRelativeTime(shortLocale, created_at)}
                            {name !== null && name.length > 0 ? (
                                <span className={styles.authorName}> - {name}</span>
                            ) : null}
                        </div>
                        {created_at !== updated_at ? (
                            <div className={styles.updatedDate}>
                                <span>Mis à jour</span>
                                {/* Remplacer selon le last vote score, ou le dernier reply (le plus récent) */}
                                <span> : </span>
                                {getRelativeTime(shortLocale, updated_at)}
                            </div>
                        ) : null}
                    </div>
                    {comment !== null && comment.length > 0 ? (
                        <div className={styles.comment}>{comment}</div>
                    ) : null}
                    {photo_path !== null && photo_path.length > 0 ? (
                        <img
                            className={styles.photo}
                            src={photo_path}
                            alt={intl.formatMessage({ id: 'photo' })}
                        />
                    ) : null}
                    <div className={styles.voteContainer}>
                        <div className={styles.voteButtonContainer}>
                            <button
                                type="button"
                                className={styles.positive}
                                style={{ backgroundColor: positiveVoteColor }}
                                onClick={onVotePositive}
                            >
                                {positiveVoteLabel !== null ? (
                                    positiveVoteLabel[shortLocale]
                                ) : (
                                    <FormattedMessage id="vote-positive" />
                                )}
                                <span>{` (${positive})`}</span>
                            </button>
                        </div>
                        <div className={styles.voteButtonContainer}>
                            <button
                                type="button"
                                className={styles.negative}
                                style={{ backgroundColor: negativeVoteColor }}
                                onClick={onVoteNegative}
                            >
                                {negativeVoteLabel !== null ? (
                                    negativeVoteLabel[shortLocale]
                                ) : (
                                    <FormattedMessage id="vote-negative" />
                                )}
                                <span>{` (${negative})`}</span>
                            </button>
                        </div>
                    </div>
                    <div className={styles.repliesCount}>
                        <CommentsIcon colored={replies.length > 0} />
                        {replies.length > 0 ? <span>{replies.length}</span> : null}
                    </div>
                    <div className={styles.replies}>
                        {replies.map(
                            (
                                { created_at: replyDate, name: replyName, message: replyMessage },
                                replyIndex,
                            ) => (
                                <div key={`reply-${replyIndex}`} className={styles.reply}>
                                    <div className={styles.replyDate}>
                                        <span>{getRelativeTime(shortLocale, replyDate)}</span>
                                        {replyName !== null && replyName.length > 0 ? (
                                            <span className={styles.replyName}> - {replyName}</span>
                                        ) : null}
                                    </div>
                                    <div className={styles.replyMessage}>{replyMessage}</div>
                                </div>
                            ),
                        )}
                    </div>
                    <ReplyForm key={id} className={styles.replyForm} contributionId={id} onSuccess={onReplySuccess} />
                </div>
            ) : null}
            {children}
            <CloseButton className={styles.close} onClick={onClose} />
        </div>
    );
}

ContributionDetails.propTypes = propTypes;
ContributionDetails.defaultProps = defaultProps;

export default ContributionDetails;
