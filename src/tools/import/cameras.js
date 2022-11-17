// uses %APP_FOLDER%/data/import to output an array to use for an /import api call
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const input = 'data/import/cameras/input.json';
const output = 'data/import/cameras/output.json';

const rawdata = fs.readFileSync(input);
const data = JSON.parse(rawdata);

const contributions = data.features.map(
    ({ geometry: { coordinates }, properties: { nid, titre, 'url-image-en-direct': liveUrl } }) => {
        return {
            coords: coordinates.join(','),
            external_id: nid,
            issue_id: 2,
            name: 'Ville de Montréal',
            comment: titre,
            created_at: '2022-01-01 00:00:00',
            is_external: true,
            external_photo: liveUrl,
        };
    },
);

const contributionsString = JSON.stringify({
    key: process.env.API_IMPORT_KEY,
    contributions,
});

fs.writeFileSync(output, contributionsString);
console.log(`Wrote ${contributions.length} contributions in ${output}`);
