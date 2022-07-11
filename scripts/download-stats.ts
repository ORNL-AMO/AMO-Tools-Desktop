import axios, { AxiosError, AxiosResponse } from 'axios';
import * as Papa from 'papaparse';
import { promises as fs, existsSync } from 'fs';
import * as path from 'path';

const API_URL_MEASUR = 'https://api.github.com/repos/ORNL-AMO/AMO-Tools-Desktop';
const MAX_PAGES = 10;
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
    
    if (!existsSync(OUTPUT_DIR)) {
        console.log('Output directory does not exist. Creating...');
        fs.mkdir(OUTPUT_DIR);
    }
    
    const headers = getHeaders();
    const releases = await getReleases(headers);
    // const releases = require('./download-stats/raw-data.json');
    const csv = parseReleases(releases);
    outputCsv(csv);
}

function getHeaders() {
    let headers = {};
    
    if (process.env.git_token) {
        headers = {'Authorization': process.env.git_token};
    }
    else {
        console.log(
            'WARNING: Could not find a GitHub user access token in the system environment variables. Web requests may be limited without one.' +
            ' If you encounter issues, please create a GitHub access token' +
            ' (https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)' +
            ' and then set it as an environment variable called "git_token".\n'
        );
    }
    return headers;
}

async function getReleases(reqHeaders) {
    let releases = [];
    
    for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
        console.log(`Requesting page ${pageNum} from the GitHub API...`);
        let response = await getUrl(API_URL_MEASUR + `/releases`, {
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
    
    let outPath = path.join(OUTPUT_DIR, 'raw-data.json');
    await fs.writeFile(outPath, JSON.stringify(releases), {encoding: 'utf-8'});
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
            if (name === 'latest-linux.yml')        newDatum[LatestLinux] = count;
            else if (name === 'latest-mac.yml')     newDatum[LatestMac] = count;
            else if (name === 'latest.yml')         newDatum[Latest] = count;
            else if (name.endsWith('.appimage'))    newDatum[AppImage] = count;
            else if (name.endsWith('.tar.gz'))      newDatum[TarGz] = count;
            else if (name.endsWith('.exe'))         newDatum[Windows] = count;
            else if (name.endsWith('.dmg'))         newDatum[MacDMG] = count;
            else if (name.endsWith('mac.zip'))      newDatum[MacZip] = count;
        }
        jsonData.push(newDatum);
    }
    
    const columns = ['Name', 'Date', Windows, MacDMG, MacZip, AppImage, TarGz, Latest, LatestMac, LatestLinux];
    const csv = Papa.unparse(jsonData, { columns: columns, quotes: true });
    
    return csv;
}

function outputCsv(csv) {
    let outPath = path.join(OUTPUT_DIR, 'downloads.csv');
    fs.writeFile(outPath, csv, {encoding: 'utf-8'});
    console.log(`Wrote CSV output to ${outPath}`);
}

function printLimits(headers) {
    let limitTotal = getNumber(headers['x-ratelimit-limit']);
    let limitLeft = getNumber(headers['x-ratelimit-remaining']);
    let limitReset = getNumber(headers['x-ratelimit-reset']);
    let resetDate = new Date(limitReset * 1000);

    console.log(`API rate limit: ${limitLeft}/${limitTotal} API requests remaining until ${resetDate.toLocaleTimeString()}`);
}

function getNumber(thing) {
    return parseFloat(String(thing));
}

async function getUrl(url, params?): Promise<AxiosResponse<any, any> >{
    try {
        const response = await axios.get(url, params);
        if (typeof response.data !== 'object') {
            console.warn('API didn\'t return JSON. Did it change since this script was written? Maybe tweak the provided headers in getHeaders().');
            process.exit(1);
        }
        return response;
    }
    catch (err) {
        if (err instanceof AxiosError) {
            console.error(`Error: ${err.code}, Message: ${err.message}, Url: ${url}`);
            if (err.response && err.response.data) {
                console.log(err.response.data);
            }
        }
        else {
            console.log('Unrecognized error:');
            console.error(err);
        }
        process.exit(1);
    }
}