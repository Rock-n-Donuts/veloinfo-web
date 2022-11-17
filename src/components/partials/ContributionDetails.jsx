import PropTypes from 'prop-types';
import classNames from 'classnames';
import CloseButton from '../buttons/Close';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { v1 as uuid } from 'uuid';
import axios from 'axios';
import { useUpdateContribution } from '../../contexts/DataContext';
import CommentsIcon from '../../icons/Comments';
import contributionTypesIcons from '../../icons/contributions';
import { getRelativeTime } from '../../lib/utils';
import ReplyForm from '../forms/ReplyForm';

import contributionsTypes from '../../data/contributions-types.json';
import styles from '../../styles/partials/contribution-details.module.scss';
import ContributionReply from './ContributionReply';

const propTypes = {
    className: PropTypes.string,
    contribution: PropTypes.shape({}),
    children: PropTypes.node,
    onClose: PropTypes.func,
    onReady: PropTypes.func,
};

const defaultProps = {
    className: null,
    contribution: null,
    children: null,
    onClose: null,
    onReady: null,
};

function ContributionDetails({ className, contribution, children, onClose, onReady }) {
    const {
        id = null,
        issue_id,
        quality,
        comment,
        created_at,
        name = null,
        image = null,
        replies = [],
        score,
        updated_at,
    } = contribution || {};

    const intl = useIntl();
    const { locale } = intl;

    const now = useMemo(() => new Date().getTime(), []);

    const createdAtRelativeTime = useMemo(
        () => getRelativeTime(locale, created_at),
        [locale, created_at],
    );
    const updatedAtRelativeTime = useMemo(
        () => getRelativeTime(locale, updated_at),
        [locale, updated_at],
    );

    const contributionType = contributionsTypes.reduce((prev, ct) => {
        if (prev !== null) {
            return prev;
        }
        const { id, contributions = null } = ct;

        if (`${id}` === `${issue_id}`) {
            return ct;
        } else if (contributions !== null) {
            return contributions.find(({ id: cid }) => cid === issue_id);
        } else {
            return null;
        }
    }, null);

    const {
        label: contributionTypeLabel,
        icon: contributionTypeIcon,
        color: contributionTypeColor,
        votes: contributionTypeVotes,
        hideCreatedDate: contributionTypeHideCreatedDate,
        qualities: contributionTypeQualities = null,
    } = contributionType || {};
    const contributionTypeQuality =
        contributionTypeQualities !== null
            ? contributionTypeQualities.find(({ value }) => parseInt(value) === parseInt(quality))
            : null;

    const { icon: contributionTypeQualityIcon = null, color: contributionTypeQualityColor = null } =
        contributionTypeQuality || {};
    const finalContributionIcon =
        contributionTypeQualityIcon !== null ? contributionTypeQualityColor : contributionTypeIcon;
    const finalContributionColor =
        contributionTypeQualityColor !== null
            ? contributionTypeQualityColor
            : contributionTypeColor;

    const { positive: contributionTypePositive = null, negative: contributionTypeNegative = null } =
        contributionTypeVotes || {};
    const { label: positiveVoteLabel = null, color: positiveVoteColor = null } =
        contributionTypePositive || {};
    const { label: negativeVoteLabel = null, color: negativeVoteColor = null } =
        contributionTypeNegative || {};

    const {
        positive = 0,
        negative = 0,
        // lastVote = null
    } = score || {};
    // console.log(lastVote)
    // const totalVote = positive + negative;

    const hasComments = replies.length > 0;

    const [canVote, setCanVote] = useState(false);
    const [voteLoading, setVoteLoading] = useState(false);
    const [formKey, setFormKey] = useState(id);

    const updateContribution = useUpdateContribution();

    const vote = useCallback(
        (score) => {
            setVoteLoading(true);
            axios
                .post(`/contribution/${id}/vote`, { score })
                .then((res) => {
                    const { data } = res || {};
                    const { success = false, contribution = null } = data || {};
                    if (success && contribution !== null) {
                        setCanVote(false);
                        updateContribution(contribution);
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
        [id, setCanVote, setVoteLoading, updateContribution],
    );

    const onVotePositive = useCallback(() => {
        vote(1);
    }, [vote]);
    const onVoteNegative = useCallback(() => {
        vote(-1);
    }, [vote]);

    const [ready, setReady] = useState(false);
    useEffect(() => {
        if (onReady !== null) {
            onReady(ready);
        }
    }, [ready, onReady]);

    useEffect(() => {
        if (id !== null) {
            setCanVote(false);
            axios
                .get(`/contribution/${id}`)
                .then((res) => {
                    const { data } = res || {};
                    const { can_vote = false } = data || {};
                    if (can_vote) {
                        setCanVote(true);
                    }
                })
                .finally(() => {
                    setReady(true);
                });
        }
    }, [id]);

    const onReplySuccess = useCallback(
        (contribution) => {
            setFormKey(`${id}-${uuid()}`);
            updateContribution(contribution);
        },
        [id, updateContribution, setFormKey],
    );

    const {
        url: imageUrl = null,
        width: imageWidth = null,
        height: imageHeight = null,
    } = image || {};
    const finalImageUrl = useMemo(() => {
        const { url, is_external = false } = image || {};
        return is_external && url !== null ? `${url}?${now}` : url;
    }, [image, now]);

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                    [styles.ready]: ready,
                    [styles.voteDisabled]: !canVote || voteLoading,
                },
            ])}
        >
            {contribution !== null ? (
                <div className={styles.content}>
                    <div
                        className={styles.contributionType}
                        style={{ backgroundColor: finalContributionColor }}
                    >
                        <img
                            className={styles.icon}
                            src={contributionTypesIcons[finalContributionIcon]}
                            alt={finalContributionIcon}
                        />
                        <span className={styles.label}>{contributionTypeLabel[locale]}</span>
                    </div>
                    <div className={styles.dates}>
                        {!contributionTypeHideCreatedDate ? (
                            <div className={styles.createdDate}>
                                <span>Signalé</span>
                                <span> : </span>
                                {createdAtRelativeTime}
                                {name !== null && name.length > 0 ? (
                                    <span className={styles.authorName}> - {name}</span>
                                ) : null}
                            </div>
                        ) : null}
                        {created_at !== updated_at ? (
                            <div className={styles.updatedDate}>
                                <span>Mis à jour</span>
                                {/* Remplacer selon le last vote score, ou le dernier reply (le plus récent) */}
                                <span> : </span>
                                {updatedAtRelativeTime}
                            </div>
                        ) : null}
                    </div>
                    {comment !== null && comment.length > 0 ? (
                        <div className={styles.comment}>{comment}</div>
                    ) : null}
                    {image !== null && imageUrl.length > 0 ? (
                        <img
                            className={styles.photo}
                            src={finalImageUrl}
                            width={imageWidth}
                            height={imageHeight}
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
                                    positiveVoteLabel[locale]
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
                                    negativeVoteLabel[locale]
                                ) : (
                                    <FormattedMessage id="vote-negative" />
                                )}
                                <span>{` (${negative})`}</span>
                            </button>
                        </div>
                    </div>
                    <div
                        className={classNames([
                            styles.repliesCount,
                            { [styles.hasComments]: hasComments },
                        ])}
                    >
                        <CommentsIcon colored={hasComments} />
                        <span>
                            {hasComments ? replies.length : <FormattedMessage id="no-comments" />}
                        </span>
                    </div>
                    <div className={styles.replies}>
                        {replies.map(
                            (
                                { created_at: replyDate, name: replyName, message: replyMessage },
                                replyIndex,
                            ) => (
                                <ContributionReply
                                    key={`reply-${replyIndex}`}
                                    className={styles.reply}
                                    date={replyDate}
                                    name={replyName}
                                    message={replyMessage}
                                />
                            ),
                        )}
                    </div>
                    <ReplyForm
                        key={formKey}
                        className={styles.replyForm}
                        contributionId={id}
                        onSuccess={onReplySuccess}
                    />
                </div>
            ) : null}
            {children}
            <CloseButton className={styles.close} onClick={onClose} color="#FFF" />
        </div>
    );
}

ContributionDetails.propTypes = propTypes;
ContributionDetails.defaultProps = defaultProps;

export default ContributionDetails;
