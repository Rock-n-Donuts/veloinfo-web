// uses %APP_FOLDER%/data/import to output an array to use for an /import api call
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const input = 'data/import/shops/input.geojson';
const output = 'data/import/shops/output.json';

const rawdata = fs.readFileSync(input);
const data = JSON.parse(rawdata);
const { features = [] } = data || {};

const contributions = features.map(
    ({
        id,
        geometry: { coordinates, type },
        properties: {
            name = null,
            'addr:housenumber': houseNumber = null,
            'addr:street': street = null,
            phone = null,
            opening_hours = null,
            website = null,
        },
    }) => {
        const comment = `${
            name !== null
                ? `${name}
        `
                : ''
        }${
            houseNumber !== null && street !== null
                ? `${houseNumber} ${street}
        `
                : ''
        }${
            phone !== null
                ? `${phone}
        `
                : ''
        }${
            opening_hours !== null
                ? `${opening_hours}
        `
                : ''
        }${
            website !== null
                ? `${website}
        `
                : ''
        }`;

        return {
            coords: (type === 'Point' ? coordinates : coordinates[0]).join(','),
            external_id: id,
            issue_id: 5,
            name: 'Open Street Maps',
            comment: comment.trim(),
            created_at: '2022-11-06 00:00:00',
            is_external: false,
        };
    },
);

const contributionsString = JSON.stringify({
    key: process.env.API_IMPORT_KEY,
    contributions,
});

fs.writeFileSync(output, contributionsString);
console.log(`Wrote ${contributions.length} contributions in ${output}`);
