import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CloseButton from '../buttons/Close';
import { FormattedMessage, useIntl } from 'react-intl';
import { v1 as uuid } from 'uuid';
import axios from 'axios';
import { isAfter, parseISO } from 'date-fns';
import parse from 'html-react-parser';

import { useUpdateContribution } from '../../contexts/DataContext';
import Meta from './Meta';
import ContributionReply from './ContributionReply';
import CommentsIcon from '../../icons/Comments';
import contributionTypesIcons from '../../icons/contributions';
import { getRelativeTime, parseDate } from '../../lib/utils';
import ReplyForm from '../forms/ReplyForm';
import contributionTypes from '../../data/contribution-types.json';

import styles from '../../styles/partials/contribution-details.module.scss';

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
        comment = null,
        created_at,
        name = null,
        replies = [],
        image = null,
        is_video,
        score,
        updated_at,
        external_id = null,
    } = contribution || {};

    const intl = useIntl();
    const { locale } = intl;

    const parsedComment = useMemo(() => {
        if (comment !== null && comment.length > 0) {
            try {
                const jsonComment = JSON.parse(comment);
                return jsonComment[locale];
            } catch {
                return comment;
            }
        }
        return comment;
    }, [comment, locale]);

    const strippedComment = useMemo(
        () => (parsedComment || '').replace(/(<([^>]+)>)/gi, ''),
        [parsedComment],
    );

    const contributionType = contributionTypes.reduce((prev, ct) => {
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
        votes: contributionTypeVotes = null,
        hideCreatedDate: contributionTypeHideCreatedDate,
        qualities: contributionTypeQualities = null,
    } = contributionType || {};
    const contributionTypeQuality =
        contributionTypeQualities !== null
            ? contributionTypeQualities.find(({ value }) => `${value}` === `${quality}`)
            : null;

    const {
        icon: contributionTypeQualityIcon = null,
        color: contributionTypeQualityColor = null,
        label: contributionTypeQualityLabel = null,
    } = contributionTypeQuality || {};
    const finalContributionIcon =
        contributionTypeQualityIcon !== null ? contributionTypeQualityColor : contributionTypeIcon;
    const contributionColor =
        contributionTypeQualityColor !== null
            ? contributionTypeQualityColor
            : contributionTypeColor;

    const { positive: contributionTypePositive = null, negative: contributionTypeNegative = null } =
        contributionTypeVotes || {};
    const { label: positiveVoteLabel = null, color: positiveVoteColor = null } =
        contributionTypePositive || {};
    const { label: negativeVoteLabel = null, color: negativeVoteColor = null } =
        contributionTypeNegative || {};

    const { positive = 0, negative = 0, last_vote = null, last_vote_date = null } = score || {};
    const finalContributionColor = `${last_vote}` === `${-1}` ? '#999' : contributionColor;

    const lastAction = useMemo(() => {
        const lastReply = replies !== null ? replies[replies.length - 1] : null;
        const { created_at: lastReplyDate = null, name: lastReplyName = null } = lastReply || {};
        const hasUpdate = updated_at !== null;
        const hasReply = lastReplyDate !== null;
        const hasVoted = last_vote_date !== null;
        if (hasUpdate) {
            const lastActionVoted =
                (!hasReply && hasVoted) ||
                isAfter(parseISO(last_vote_date), parseISO(lastReplyDate));
            return {
                label: `${intl.formatMessage({ id: lastActionVoted ? 'voted' : 'replied' })}${
                    lastActionVoted
                        ? ` "${
                              contributionTypeVotes !== null
                                  ? (last_vote === 1 ? positiveVoteLabel : negativeVoteLabel)[
                                        locale
                                    ]
                                  : intl.formatMessage({
                                        id: last_vote === 1 ? 'vote-positive' : 'vote-negative',
                                    })
                          }"`
                        : ``
                }`,
                author: lastActionVoted ? null : lastReplyName,
            };
        }
        return null;
    }, [
        replies,
        last_vote_date,
        updated_at,
        intl,
        last_vote,
        positiveVoteLabel,
        negativeVoteLabel,
        locale,
        contributionTypeVotes,
    ]);

    const reversedReplies = useMemo(() => [...replies].reverse(), [replies]);

    const { label: lastActionLabel = null, author: lastActionAuthor = null } = lastAction || {};

    const [now, setNow] = useState(new Date());
    const createdAtParsedTime = useMemo(
        () =>
            intl.formatDate(parseDate(created_at), {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            }),
        [intl, created_at],
    );
    const createdAtRelativeTime = useMemo(
        () => getRelativeTime(locale, created_at),
        [locale, created_at],
    );
    const updatedAtRelativeTime = useMemo(
        () => getRelativeTime(locale, updated_at, now),
        [locale, updated_at, now],
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 500);
        return () => {
            if (interval !== null) {
                clearInterval(interval);
            }
        };
    }, [locale]);

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

    const finalMediaUrl = useMemo(() => {
        const { url = null, is_external = false } = image || {};
        return is_external && !is_video && url !== null ? `${url}?${new Date().getTime()}` : url;
    }, [image, is_video]);

    const hasMedia = finalMediaUrl !== null || (is_video && external_id !== null);

    const videoPlayerRef = useRef(null);

    useEffect(() => {
        let player;

        if (is_video && external_id !== null) {
            const isYoutubeReady = typeof window.YT !== 'undefined';

            const playVideo = () => {
                player = new window.YT.Player(videoPlayerRef.current, {
                    height: '360',
                    width: '640',
                    videoId: external_id,
                    events: {
                        onReady: () => {
                            player.mute();
                            player.playVideo();
                        },
                    },
                    playerVars: {
                        modestbranding: 1,
                        autoplay: 1,
                        mute: 1,
                        playsinline: 1,
                        rel: 0,
                    },
                });
            };

            if (isYoutubeReady) {
                playVideo();
            } else {
                window.onYouTubePlayerAPIReady = playVideo;
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }
        }

        return () => {
            player = null;
        };
    }, [is_video, external_id]);

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
                    <Meta
                        title={
                            `${issue_id}` === '1'
                                ? `${createdAtParsedTime} - ${contributionTypeQualityLabel[locale]} #${id}`
                                : `${contributionTypeLabel[locale]} #${id} - ${strippedComment}`
                        }
                        description={`${strippedComment}${
                            name !== null && name.length > 0 ? ` - ${name}` : ``
                        }`}
                        image={imageUrl}
                    />
                    <div
                        className={styles.contributionType}
                        style={{ backgroundColor: finalContributionColor }}
                    >
                        <img
                            className={styles.icon}
                            src={contributionTypesIcons[finalContributionIcon]}
                            alt={finalContributionIcon}
                        />
                        <div className={styles.labelContainer}>
                            <div className={styles.label}>{contributionTypeLabel[locale]}</div>
                            {contributionTypeQualityLabel !== null ? (
                                <div className={styles.qualityLabel}>
                                    {contributionTypeQualityLabel[locale]}
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className={styles.dates}>
                        {!contributionTypeHideCreatedDate ? (
                            <div className={styles.createdDate}>
                                <span>
                                    <FormattedMessage id="reported" />
                                </span>
                                <span> </span>
                                <span title={createdAtParsedTime}>{createdAtRelativeTime}</span>
                                {name !== null && name.length > 0 ? (
                                    <span className={styles.authorName}> - {name}</span>
                                ) : null}
                            </div>
                        ) : null}
                        {created_at !== updated_at ? (
                            <div className={styles.updatedDate}>
                                <span>{lastActionLabel}</span>
                                <span> </span>
                                {updatedAtRelativeTime}
                                {lastActionAuthor !== null && lastActionAuthor.length > 0 ? (
                                    <span className={styles.authorName}> - {lastActionAuthor}</span>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                    {comment !== null && comment.length > 0 ? (
                        <div className={styles.comment}>
                            <div className={styles.body}>{parse(parsedComment)}</div>
                        </div>
                    ) : null}
                    {hasMedia ? (
                        <div className={styles.media}>
                            {is_video ? (
                                <div className={styles.videoContainer}>
                                    {finalMediaUrl !== null ? (
                                        <iframe
                                            className={styles.video}
                                            src={finalMediaUrl}
                                            width="560"
                                            height="315"
                                            title="Video player"
                                            frameborder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
                                            allowfullscreen
                                        />
                                    ) : (
                                        <div className={styles.video} ref={videoPlayerRef} />
                                    )}
                                </div>
                            ) : (
                                <img
                                    className={styles.photo}
                                    src={finalMediaUrl}
                                    width={imageWidth}
                                    height={imageHeight}
                                    alt={intl.formatMessage({ id: 'photo' })}
                                />
                            )}
                        </div>
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
                        {reversedReplies.map(
                            ({
                                created_at: replyDate,
                                name: replyName,
                                message: replyMessage,
                                id: replyId,
                            }) => (
                                <ContributionReply
                                    key={`reply-${replyId}`}
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
