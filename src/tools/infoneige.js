// uses %APP_FOLDER%/data/infoneige
const fs = require('fs');
const dotenv = require('dotenv');
const xml2json = require('xml2json');
dotenv.config();

const start = new Date().getTime();

console.log('parsing xml...');
const infoNeige = JSON.parse(xml2json.toJson(fs.readFileSync('data/infoneige/input/response.xml')));
let planifications =
    infoNeige['S:Envelope']['S:Body']['ns0:GetPlanificationsForDateResponse'][
        'planificationsForDateResponse'
    ]['planifications']['planification'];

console.log('sorting planifications...');
const uniqueIds = [];
planifications.sort((a, b) => b.dateMaj.localeCompare(a.dateMaj));

console.log('filtering planifications...');
planifications = planifications.filter(({ coteRueId }) => {
    const unique = uniqueIds.indexOf(coteRueId) === -1;
    if (unique) {
        uniqueIds.push(coteRueId);
    }
    return unique;
})

console.log('parsing json...');
const { features: troncons } = JSON.parse(fs.readFileSync('data/infoneige/input/reseau_cyclable.geojson'));
const { features: cotes } = JSON.parse(fs.readFileSync('data/infoneige/input/gbdouble.json'));

function getFilteredCotes() {
    console.log('filtering cotes...');
    const filteredCotes = cotes.filter(
        ({ properties: { COTE_RUE_ID } }) =>
            uniqueIds.indexOf(`${parseInt(COTE_RUE_ID)}`) > -1,
    );
    console.log(cotes.length, filteredCotes.length);
    return filteredCotes;
}

function getFilteredTroncons() {
    console.log('filtering troncons...');
    const filteredTroncons = troncons.filter(
        ({ properties: { ID_TRC } }) =>
            uniqueIds.indexOf(`${parseInt(ID_TRC)}1`) > -1 ||
            uniqueIds.indexOf(`${parseInt(ID_TRC)}2`) > -1,
    );
    console.log(troncons.length, filteredTroncons.length);
    return filteredTroncons;
}

function writeGeojson(features, name) {
    const geojson = {
        type: 'FeatureCollection',
        features,
    };
    fs.writeFileSync(`data/infoneige/output/${name}.geojson`, JSON.stringify(geojson));
}

writeGeojson(getFilteredTroncons(), 'troncons');
writeGeojson(getFilteredCotes(), 'cotes');

const end = new Date().getTime();

console.log('Done in', `${(end - start) / 1000} seconds.`);

// const features = planifications.map(({ munid, coteRueId, etatDeneig }) => ({
//     munid, coteRueId, etatDeneig
// }));