const Papa = require('papaparse');
const path = require('path');
const fs = require('fs');
const { getHeaders,
    outputCsv,
    printLimits,
    getUrl} = require('./lib/index');

const API_URL_MEASUR = 'https://api.github.com/repos/ORNL-AMO/AMO-Tools-Desktop';
const API_URL_VERIFI = 'https://api.github.com/repos/ORNL-AMO/VERIFI';

const MAX_PAGES = 20;
const OUTPUT_DIR = path.join(__dirname, 'download-stats');

// Field name strings
const LatestLinux = 'latest-linux.yml';
const LatestMac = 'latest-mac.yml';
const Latest = 'latest.yml';
const AppImage = 'Linux AppImage';
const TarGz = 'Linux Tar.GZ';
const Windows = 'Windows';
const MacZip = 'Mac .ZIP';
const MacDMG = 'Mac .DMG';

main();

async function main() {

    if (!fs.existsSync(OUTPUT_DIR)) {
        console.log('Output directory does not exist. Creating...');
        fs.mkdirSync(OUTPUT_DIR);
    }

    const headers = getHeaders();
    const releasesMeasur = await getReleases(headers, API_URL_MEASUR, 'raw_MEASUR_data.json');
    const releaseMeasurCSV = parseReleases(releasesMeasur);
    outputCsv(releaseMeasurCSV, 'MEASUR_downloads.csv', OUTPUT_DIR);

    const releasesVERIFI = await getReleases(headers, API_URL_VERIFI, 'raw_VERIFI_data.json');
    const releaseVerifiCSV = parseReleases(releasesVERIFI);
    outputCsv(releaseVerifiCSV, 'VERIFI_downloads.csv', OUTPUT_DIR);
}

async function getReleases(reqHeaders, URL, jsonURL) {
    let releases = [];

    for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
        console.log(`Requesting page ${pageNum} from the GitHub API...`);
        let response = await getUrl(URL + `/releases`, {
            params: {
                page: pageNum,
                per_page: 100
            },
            headers: reqHeaders,
        });
        let headers = response.headers;
        let data = response.data;
        if (data.length === 0) {
            console.log('Reached last page.');
            break;
        }
        releases.push(...response.data);
        printLimits(headers);
    }

    console.log(`Found ${releases.length} releases in total.`);
    let outPath = path.join(OUTPUT_DIR, jsonURL);
    await fs.writeFileSync(outPath, JSON.stringify(releases));
    // await fs.writeFileSync(outPath, JSON.stringify(releases), { encoding: 'utf-8' });
    console.log(`Wrote raw output to ${outPath}`);
    return releases;
}


function parseReleases(releases) {
    const jsonData = [];

    for (let release of releases) {
        let newDatum = {};
        newDatum['Name'] = release.name;
        newDatum['Date'] = release.published_at.replace('T', ' ').replace('Z', ''); // ISO string -> yyyy-MM-dd HH:mm:ss
        for (let asset of release.assets) {
            let name = asset.name.toLowerCase();
            let count = asset.download_count;
            if (name === 'latest-linux.yml') newDatum[LatestLinux] = count;
            else if (name === 'latest-mac.yml') newDatum[LatestMac] = count;
            else if (name === 'latest.yml') newDatum[Latest] = count;
            else if (name.endsWith('.appimage')) newDatum[AppImage] = count;
            else if (name.endsWith('.tar.gz')) newDatum[TarGz] = count;
            else if (name.endsWith('.exe')) newDatum[Windows] = count;
            else if (name.endsWith('.dmg')) newDatum[MacDMG] = count;
            else if (name.endsWith('mac.zip')) newDatum[MacZip] = count;
        }
        jsonData.push(newDatum);
    }

    const columns = ['Name', 'Date', Windows, MacDMG, MacZip, AppImage, TarGz, Latest, LatestMac, LatestLinux];
    const csv = Papa.unparse(jsonData, { columns: columns, quotes: true });

    return csv;
}

