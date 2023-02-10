import { Request, Response } from 'express';
import { contributions } from '@prisma/client';
import { resizeAndUpload } from './images';
import prisma from './prisma';

type ReplyResponse = {};

type ContributionResponse = {
    id: number;
    created_at: Date | null;
    issue_id: number | null;
    comment: String | null;
    user_id: String | null;
    name: String | null;
    quality: null | number;
    external_id: number;
    is_external: boolean;
    is_deleted: number | null;
    replies: [ReplyResponse] | [];
    coords: number[] | undefined;
    score: {
        positive: number;
        negative: number;
        last_vote: String;
        last_vote_date: String;
    };
    updated_at: String;
    image: {
        url: String | null;
        width: number | null;
        height: number | null;
        is_external: boolean;
    };
};

const getContributionsTroncons = async (req: Request, res: Response) => {
    const from = req.body.from;
    const contributions = await prisma.contributions.findMany({
        where: {
            created_at: { gte: from },
        },
    });
    const troncons = await prisma.troncons.findMany({
        where: {
            updated_at: { gte: from },
        },
    });

    const contributionResponses = contributions.map(mapContributionsToContributionResponse);
    res.send({ contributions: contributionResponses, troncons });
};

const postContribution = async (req: Request, resp: Response) => {
    const m = req.headers['authorization']?.match(/Bearer (.*)/);
    const user_id = m ? m[1] : 'undefined';

    if (req.file) {
        const { name, width, height } = resizeAndUpload(req.file);
    }

    const contribution = await prisma.contributions.create({
        data: {
            location: req.body.coords[0],
            comment: req.body.comment,
            created_at: new Date(),
            issue_id: +req.body.issue_id,
            user_id,
            name: req.body.name,
            quality: parseInt(req.body.quality),
        },
    });

    resp.send({
        success: true,
        contribution: mapContributionsToContributionResponse(contribution),
    });
};

const mapContributionsToContributionResponse = (
    contribution: contributions,
): ContributionResponse => ({
    id: contribution.id,
    created_at: contribution.created_at,
    issue_id: contribution.issue_id,
    comment: contribution.comment,
    user_id: contribution.user_id,
    name: contribution.name,
    quality: contribution.quality,
    external_id: 0,
    is_external: false,
    is_deleted: contribution.is_deleted,
    replies: [],
    coords: contribution.location?.split(',').map((c) => parseFloat(c)),
    score: {
        positive: 0,
        negative: 0,
        last_vote: '',
        last_vote_date: '',
    },
    updated_at: '',
    image: {
        url: contribution.photo_path,
        width: contribution.photo_width,
        height: contribution.photo_height,
        is_external: true,
    },
});

export { getContributionsTroncons, postContribution };
