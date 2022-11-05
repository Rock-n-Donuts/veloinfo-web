// uses %APP_FOLDER%/to-import/input.json to output an array to use for an /import api call
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const input = 'to-import/input.json';
const output = 'to-import/output.json';

const rawdata = fs.readFileSync(input);
const data = JSON.parse(rawdata);
const contributions = data.map(({
    LONG,
    LAT,
    MARQ,
    DATE_INSPECTION,
    PARC
}) => {

    const description = (MARQ !== 'Support à bicyclettes à valider') ? `${MARQ} ` : '';
    const inPark = PARC !== '' ? `au parc ${PARC}` : '';
    const inspectedDate = DATE_INSPECTION !== '' ? `${DATE_INSPECTION} 00:00:00` : '2022-11-06 00:00:00';

    return {
        coords: `${LONG}, ${LAT}`,
        issue_id: 2,
        name: 'Ville de Montréal',
        comment: `${description}${inPark}`,
        created_at: inspectedDate
    };
});
const contributionsString = JSON.stringify(contributions);

fs.writeFileSync(output, contributionsString);
console.log(`Wrote ${contributions.length} contributions in ${output}`);