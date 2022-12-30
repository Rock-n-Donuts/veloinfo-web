import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPaperPlane, faPencil, faPlus } from '@fortawesome/free-solid-svg-icons';

import { useUserCurrentContribution, useUserUpdateContribution } from '../../contexts/SiteContext';
import FormGroup from '../forms/FormGroup';
import ContributionIcon from '../../icons/Contribution';
import contributionTypes from '../../data/contribution-types.json';

import styles from '../../styles/buttons/add-contribution.module.scss';

const propTypes = {
    className: PropTypes.string,
    opened: PropTypes.bool,
    loading: PropTypes.bool,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    onSelect: PropTypes.func,
    onSend: PropTypes.func,
};

const defaultProps = {
    className: null,
    opened: false,
    loading: false,
    onOpen: null,
    onClose: null,
    onSelect: null,
    onSend: null,
};

function AddContributionButton({ className, opened, loading, onOpen, onClose, onSelect, onSend }) {
    const intl = useIntl();
    const { locale } = intl;
    const userCurrentContribution = useUserCurrentContribution();
    const {
        coords: userContributionCoords = null,
        type: userContributionType = null,
        quality: userContributionTypeQuality = null,
        name: userContributionName,
        comment: userContributionComment,
    } = userCurrentContribution || {};

    const hasCoords = userContributionCoords !== null;

    const updateUserContribution = useUserUpdateContribution();

    const [isEditing, setIsEditing] = useState(false);

    const validTypes = useMemo(
        () => contributionTypes.filter(({ disableAdd, id }) => !disableAdd),
        [],
    );

    const onContributionTypeClick = useCallback(
        (type) => {
            const sameValue = type === userContributionType;
            if (!sameValue && onSelect !== null) {
                onSelect();
            }
            updateUserContribution({ type: sameValue ? null : type });
        },
        [updateUserContribution, userContributionType, onSelect],
    );

    const onQualityClick = useCallback(
        (type, quality) => {
            const sameValue =
                `${userContributionTypeQuality}` === `${quality}` &&
                `${type}` === `${userContributionType}`;

            if (!sameValue && onSelect !== null) {
                onSelect();
            }
            updateUserContribution(sameValue ? { type: null, quality: null } : { type, quality });
        },
        [updateUserContribution, userContributionType, userContributionTypeQuality, onSelect],
    );

    const onOpenClick = useCallback(() => {
        if (onOpen !== null) {
            onOpen();
        }
    }, [onOpen]);

    const onCloseClick = useCallback(() => {
        if (onClose !== null) {
            onClose();
        }
    }, [onClose]);

    const onToggleClick = useCallback(() => {
        if (opened) {
            updateUserContribution({ type: null, quality: null });
            onCloseClick();
        } else {
            onOpenClick();
        }
    }, [opened, onOpenClick, onCloseClick, updateUserContribution]);

    const onEditClick = useCallback(() => {
        setIsEditing((old) => !old);
    }, []);

    const onEditCloseClick = useCallback(() => {
        setIsEditing(false);
    }, []);

    const onSendClick = useCallback(() => {
        if (onSend !== null) {
            onSend();
        }
    }, [onSend]);

    const onNameChange = useCallback(
        (e) => updateUserContribution({ name: e.target.value }),
        [updateUserContribution],
    );

    const onCommentChange = useCallback(
        (e) => updateUserContribution({ comment: e.target.value }),
        [updateUserContribution],
    );

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                    [styles.opened]: opened,
                    [styles.typeSelected]: opened && userContributionType !== null,
                    [styles.isEditing]: isEditing,
                    [styles.loading]: loading,
                },
            ])}
        >
            <div className={styles.inner}>
                <div className={styles.types}>
                    {validTypes.map((contributionType, typeIndex) => {
                        const { id, label, icon, color, qualities = null } = contributionType;
                        const selected = id === userContributionType;
                        const hasQualities = (qualities || []).length > 0;
                        return (
                            <div className={styles.lol} key={`type-${typeIndex}`}>
                                {hasQualities ? (
                                    <>
                                        {qualities.map((quality, qualityIndex) => {
                                            const {
                                                value: qualityValue,
                                                color: qualityColor,
                                                label: qualityLabel,
                                            } = quality;
                                            const finalLabel = `${label[locale]} - ${qualityLabel[locale]}`;

                                            return (
                                                <div
                                                    key={`quality-${qualityIndex}`}
                                                    className={classNames([
                                                        styles.type,
                                                        {
                                                            [styles.selected]:
                                                                selected &&
                                                                `${qualityValue}` ===
                                                                    `${userContributionTypeQuality}`,
                                                        },
                                                    ])}
                                                >
                                                    <div className={styles.typeContent}>
                                                        <button
                                                            onClick={() => {
                                                                onQualityClick(id, qualityValue);
                                                            }}
                                                            className={styles.typeButton}
                                                            style={{
                                                                borderColor: qualityColor,
                                                            }}
                                                        >
                                                            <span
                                                                className={styles.iconContainer}
                                                                style={{
                                                                    backgroundColor: qualityColor,
                                                                }}
                                                            >
                                                                <ContributionIcon
                                                                    className={styles.icon}
                                                                    icon={icon}
                                                                    withoutMarker
                                                                />
                                                            </span>
                                                            <span className={styles.label}>
                                                                {finalLabel}
                                                            </span>
                                                            <span
                                                                className={styles.close}
                                                                style={{ color: qualityColor }}
                                                            >
                                                                <FontAwesomeIcon icon={faPencil} />
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </>
                                ) : (
                                    <div
                                        className={classNames([
                                            styles.type,
                                            { [styles.selected]: selected },
                                        ])}
                                    >
                                        <div
                                            className={styles.typeContent}
                                            // style={{
                                            //     transitionDelay: `${
                                            //         (validTypes.length - 1 - typeIndex) * 0.03
                                            //     }s`,
                                            // }}
                                        >
                                            <button
                                                onClick={() => {
                                                    onContributionTypeClick(id);
                                                }}
                                                className={styles.typeButton}
                                                style={{
                                                    borderColor: color,
                                                }}
                                            >
                                                <span
                                                    className={styles.iconContainer}
                                                    style={{ backgroundColor: color }}
                                                >
                                                    <ContributionIcon
                                                        className={styles.icon}
                                                        icon={icon}
                                                        withoutMarker
                                                    />
                                                </span>
                                                <span className={styles.label}>
                                                    {label[locale]}
                                                </span>
                                                <span className={styles.close} style={{ color }}>
                                                    <FontAwesomeIcon icon={faPencil} />
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <button type="button" className={styles.safe} onClick={onEditCloseClick} />
                <div className={styles.actions}>
                    <button type="button" className={styles.sendButton} onClick={onSendClick} disabled={!hasCoords}>
                        <span className={styles.label}>
                            <FormattedMessage id="send" />
                        </span>
                        <span className={styles.icon}>
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </span>
                    </button>
                    <button type="button" className={styles.editButton} onClick={onEditClick}>
                        <span className={styles.editButtonContent}>
                            <span className={styles.label}>
                                {(userContributionComment || '').length > 0 ? (
                                    userContributionComment
                                ) : (
                                    <FormattedMessage id="add-comment" values={{ br: <br /> }} />
                                )}
                            </span>
                            <span className={styles.icon}>
                                <FontAwesomeIcon icon={faPencil} />
                            </span>
                        </span>
                        <span className={styles.editButtonCloseContent}>
                            <span className={styles.label}>
                                <FormattedMessage id="ok" />
                            </span>
                            <span className={styles.icon}>
                                <FontAwesomeIcon icon={faCheck} />
                            </span>
                        </span>
                    </button>
                    <button
                        type="button"
                        className={styles.toggleOpenButton}
                        onClick={onToggleClick}
                    >
                        <span className={styles.label}>
                            <FormattedMessage id={opened ? 'cancel' : 'add'} />
                        </span>
                        <span className={styles.icon}>
                            <FontAwesomeIcon icon={faPlus} />
                        </span>
                    </button>
                </div>
                <div className={styles.editForm}>
                    <FormGroup className={styles.name}>
                        <input
                            type="text"
                            value={userContributionName || ''}
                            placeholder={intl.formatMessage({ id: 'name-placeholder' })}
                            onChange={onNameChange}
                        />
                    </FormGroup>
                    {/* ) : null} */}
                    <FormGroup className={styles.comment}>
                        <textarea
                            required
                            value={userContributionComment || ''}
                            placeholder={intl.formatMessage({ id: 'comment-placeholder' })}
                            onChange={onCommentChange}
                        />
                    </FormGroup>
                    {/* <div className={styles.editActions}>
                        <button
                            type="button"
                            onClick={onEditCloseClick}
                        >
                            <FormattedMessage id="ok" />
                        </button>
                    </div> */}
                    <div className={styles.arrow} />
                </div>
            </div>
        </div>
    );
}

AddContributionButton.propTypes = propTypes;
AddContributionButton.defaultProps = defaultProps;

export default AddContributionButton;
