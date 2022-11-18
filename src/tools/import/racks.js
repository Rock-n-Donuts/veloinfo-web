// uses %APP_FOLDER%/data/import to output an array to use for an /import api call
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const input = 'data/import/racks/input.json';
const output = 'data/import/racks/output.json';

const rawdata = fs.readFileSync(input);
const data = JSON.parse(rawdata);

const contributions = data.map(({ INV_ID, LONG, LAT, MARQ, DATE_INSPECTION, PARC }) => {
    const description = MARQ !== 'Support à bicyclettes à valider' ? `${MARQ} ` : '';
    const inPark = PARC !== '' ? `au parc ${PARC}` : '';
    const inspectedDate =
        DATE_INSPECTION !== '' ? `${DATE_INSPECTION} 00:00:00` : '2022-11-06 00:00:00';

    return {
        coords: `${LONG},${LAT}`,
        external_id: INV_ID,
        issue_id: 3,
        name: 'Ville de Montréal',
        comment: `${description}${inPark}`,
        created_at: inspectedDate,
        is_external: false,
    };
});

const contributionsString = JSON.stringify({
    key: process.env.API_IMPORT_KEY,
    contributions,
});

fs.writeFileSync(output, contributionsString);
console.log(`Wrote ${contributions.length} contributions in ${output}`);
