// uses %APP_FOLDER%/data/import to output an array to use for an /import api call
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const input = 'data/import/stations/input.geojson';
const output = 'data/import/stations/output.json';

const rawdata = fs.readFileSync(input);
const data = JSON.parse(rawdata);
const { features = [] } = data || {};

const contributions = features.map(
    ({
        id,
        geometry: { coordinates },
        properties: { brand = null, name = null, operator = null, opening_hours = null },
    }) => ({
        coords: coordinates.join(','),
        external_id: id,
        issue_id: 4,
        name: 'Open Street Maps',
        comment: `${brand !== null ? `${brand} ` : `${operator !== null ? `${operator} ` : ''}`}${
            opening_hours !== null ? `${opening_hours} ` : ''
        }`.trim(),
        created_at: '2022-11-06 00:00:00',
        is_external: false,
    }),
);

const contributionsString = JSON.stringify({
    key: process.env.API_IMPORT_KEY,
    contributions,
});

fs.writeFileSync(output, contributionsString);
console.log(`Wrote ${contributions.length} contributions in ${output}`);
