// uses %APP_FOLDER%/data/import to output an array to use for an /import api call
const fs = require('fs');
const sizeOf = require('image-size');
const https = require('https');
const dotenv = require('dotenv');

dotenv.config();

const input = 'data/import/cameras/input.json';
const output = 'data/import/cameras/output.json';

const rawdata = fs.readFileSync(input);
const { features } = JSON.parse(rawdata);

let count = 0;
const { length } = features;

const contributions = features.map(
    ({
        geometry: { coordinates },
        properties: { nid, titre, 'url-image-en-direct': liveUrl },
    }) => ({
        coords: coordinates.join(','),
        external_id: `camera/${nid}`,
        issue_id: 2,
        name: 'Ville de Montréal',
        comment: titre,
        created_at: '2022-01-01 00:00:00',
        is_external: true,
        external_photo: liveUrl,
        width: 0,
        height: 0,
    }),
);

function outputToFile() {
    const contributionsString = JSON.stringify({
        key: process.env.API_IMPORT_KEY,
        contributions,
    });

    fs.writeFileSync(output, contributionsString);
    console.log(`Wrote ${contributions.length} contributions in ${output}`);
}

features.forEach(({ properties: { nid, 'url-image-en-direct': liveUrl } }) => {
    https.get(liveUrl, {}, (response) => {
        const chunks = [];
        response
            .on('data', function (chunk) {
                chunks.push(chunk);
            })
            .on('end', function () {
                const buffer = Buffer.concat(chunks);
                const { width, height } = sizeOf(buffer);

                const contribution = contributions.find(
                    ({ external_id }) => external_id === nid,
                );
                contribution.width = width;
                contribution.height = height;
                count += 1;
                console.log(`${count}/${length}: ${width}x${height}`);
                if (count === length) {
                    outputToFile();
                }
            });
    });
});
