const axios = require('axios');
const fs = require('fs');
const path = require('path');


async function downloadImage(url, filePath) {
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
    });

    response.data.pipe(fs.createWriteStream(filePath));

    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            resolve();
        });

        response.data.on('error', (err) => {
            reject(err);
        });
    });
}

async function downloadImages(imageUrls) {
    const directory = './cameras_images';
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }

    for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        const urlParts = url.split('/')
        const fileName = urlParts[urlParts.length - 1];
        const filePath = path.join(directory, fileName);
        console.log(`Downloading ${url} to ${filePath}...`);
        try {
            await downloadImage(url, filePath);
            console.log(`Downloaded ${url} successfully.`);
        } catch (error) {
            console.error(`Error downloading ${url}: ${error.message}`);
        }
    }
}

async function getToken() {
    axios
        .request({
            url: 'https://api.veloinfo.ca/auth',
            method: 'post',
            data: {
                uuid: '1',
            },
        })
        .then((res) => {
            const { data = null } = res || {};
            const { token = null } = data || {};
            axios.defaults.headers.common = { Authorization: `Bearer ${token}` };
            axios
                .request({
                    url: 'https://api.veloinfo.ca/raw',
                    method: 'get',
                    params: {
                        troncons: null
                    },
                })
                .then(({ data }) => {
                    const { contributions } = data || {};
                    const camerasUrls = contributions.filter(({ issue_id, external_photo }) => issue_id === 2 && external_photo).map(({ external_photo }) => external_photo);
                    downloadImages(camerasUrls);
                })
        });
}

getToken();