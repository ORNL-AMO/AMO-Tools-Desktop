// Trying to do module imports with our updates node versions leads to painful troubleshooting trying 
// to get this script to run - some circular errors here when changing tsconfig and package.json settings
const axios = require('axios');
const Papa = require('papaparse');
const path = require('path');
const fs = require('fs');

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


const Repos = [
    {
        name: 'AMO-Tools-Desktop',
        labels: [
            "CO2 Emissions",
            "Compressed Air",
            "Data Explorer",
            "Databases",
            "Fans",
            "Motor Inventory",
            "Motors",
            "Process Cooling",
            "Process Heating",
            "Pumps",
            "Steam",
            "Treasure Hunt",
            "Waste Water",
            "Water",
            "Web/WebAssembly",
        ]
    },
    {
        name: 'AMO-Tools-Suite',
        labels: [
            "Compressed Air",
            "Databases",
            "Fans",
            "Motors",
            "Process Cooling",
            "Process Heating",
            "Pumps",
            "Steam",
            "Treasure Hunt",
            "Waste Water",
            "Water",
            "Web/WebAssembly",   
        ]
    },
    {
        name: 'VERIFI',
        labels: [
            "CO2 Emissions",
            "Reports",
            "Analysis",
            "Dashboard",
            "Data Input",
            "Graphs",
            "Import/Export",
            "Regression",
            "UI/UX",
            "Units",
        ]
    },
    // {
    //     name: 'Choose-Your-Own-Adventure',
    //     labels: [
    
    //     ]
    // }
]

main();

async function main() {

    if (!fs.existsSync(OUTPUT_DIR)) {
        console.log('Output directory does not exist. Creating...');
        fs.mkdir(OUTPUT_DIR);
    }

    const headers = getHeaders();
    // const releasesMeasur = await getReleases(headers, API_URL_MEASUR, 'raw_MEASUR_data.json');
    // const releaseMeasurCSV = parseReleases(releasesMeasur);
    // outputCsv(releaseMeasurCSV, 'MEASUR_downloads.csv');

    // const releasesVERIFI = await getReleases(headers, API_URL_VERIFI, 'raw_VERIFI_data.json');
    // const releaseVerifiCSV = parseReleases(releasesVERIFI);
    // outputCsv(releaseVerifiCSV, 'VERIFI_downloads.csv');

    // const issues = await getIssues(headers, API_URL_MEASUR, 'raw_MEASUR_issues.json');
    // const {csvTotals, csvIssues} = parseIssues(issues, 'MEASUR');
    const {totalsCsv, issuesCsv} = await buildIssueStatsCSVs(headers);

    console.log('finished buildIssueStatsCSVs')

    outputCsv(totalsCsv, 'AMO_total_issues.csv');
    outputCsv(issuesCsv, 'AMO_issues.csv');
}

function getHeaders() {
    let headers = {};
    if (process.env.git_token) {
        headers = { 'Authorization': `Bearer ${process.env.git_token}` };
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

async function getRepoIssuesByLabel(reqHeaders, repoName, label, repoOutputFilePath) {
    let issues = [];
    for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
        // console.log(`Requesting page ${pageNum} from the GitHub API...`);
        const URL = `https://api.github.com/repos/ORNL-AMO/${repoName}/issues?state=all&labels=${encodeURIComponent(label)}`;
        console.log('URL', URL)
        let response = await getUrl(URL, {
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
        issues.push(...response.data);
        printLimits(headers);
    }

    await fs.writeFileSync(repoOutputFilePath, JSON.stringify(issues), {flag: 'a'});
    return issues;
}

async function buildIssueStatsCSVs(headers) {
    let csvTotalDataRows = [];
    let csvIssueDataRows = []
    
    for await (let repo of Repos) {
        const repoOutFile = path.join(OUTPUT_DIR, `raw_${repo.name}_issues.json`);
        if (fs.existsSync(repoOutFile)) {
            fs.unlinkSync(repoOutFile);
        }

        const repoTotalRow = {
            'Repo': repo.name,
            'Label': 'Total',
            'Total Issues': 0, 
            'Total Open': 0,
            'Total Closed': 0
        }

        for await (let label of repo.labels) {
            const issues = await getRepoIssuesByLabel(headers, repo.name, label, repoOutFile);
            let labelTotalRowData = {
                'Repo': repo.name,
                'Label': label,
                'Total Issues': issues.length,
                'Total Open': 0,
                'Total Closed': 0
            }

            repoTotalRow['Total Issues'] += issues.length;
            for (let issue of issues) {
                let issueRowData = {
                    'Repo': repo.name,
                    'Label': label,
                    'Issue Number': issue.number,
                    'Title': issue.title,
                    'Status': issue.state.toUpperCase(),
                };
                if (issue.state === 'open') {
                    repoTotalRow['Total Open']++;
                    labelTotalRowData['Total Open']++;
                } else if (issue.state === 'closed') {
                    repoTotalRow['Total Closed']++;
                    labelTotalRowData['Total Closed']++;
                }
                csvIssueDataRows.push(issueRowData);
            }
            csvTotalDataRows.push(labelTotalRowData);
        }

        csvTotalDataRows.push(repoTotalRow);
    }
    
    const columns = ['Repo', 'Label', 'Total Issues', 'Total Open', 'Total Closed'];
    const issueColumns = ['Repo', 'Label', 'Issue Number', 'Title', 'Status'];
    const totalsCsv = Papa.unparse(csvTotalDataRows, { columns: columns, quotes: true });
    const issuesCsv = Papa.unparse(csvIssueDataRows, { columns: issueColumns, quotes: true });
    return {totalsCsv, issuesCsv};
}


// function parseIssues(issues, repoName) {
//     const csvTotalDataRows = [];
//     const csvIssueDataRows = []

//     const repoTotalRow = {
//         'Repo': repoName,
//         'Label': 'Total',
//         'Total Issues': 0, 
//         'Total Open': 0,
//         'Total Closed': 0
//     }

//     for (let measurLabel of MEASURLabels) {
//         let labelTotalRowData = {
//             'Repo': repoName,
//             'Label': measurLabel,
//             'Total Issues': 0, 
//             'Total Open': 0,
//             'Total Closed': 0
//         }

//         for (let issue of issues) {
//             let currentlabelIssue = issue.labels.find(label => label.name === measurLabel);
//             if (currentlabelIssue !== undefined)  {
//                 repoTotalRow['Total Issues']++;
//                 labelTotalRowData['Total Issues']++;
//                 if (issue.state === 'open') {
//                     repoTotalRow['Total Open']++;
//                     labelTotalRowData['Total Open']++;
//                 } else if (issue.state === 'closed') {
//                     repoTotalRow['Total Closed']++;
//                     labelTotalRowData['Total Closed']++;
//                 }
//                 let issueRowData = {
//                     'Repo': repoName,
//                     'Label': measurLabel,
//                     'Issue Number': issue.number,
//                     'Title': issue.title,
//                     'Status': issue.state.toUpperCase(),
//                 };
//                 csvIssueDataRows.push(issueRowData);
//             }
//         }

//         console.log('label row', labelTotalRowData)
//         csvTotalDataRows.push(labelTotalRowData);
//     }
    
//     csvTotalDataRows.unshift(repoTotalRow);
//     const columns = ['Repo', 'Label', 'Total Issues', 'Total Open', 'Total Closed'];
//     const csvTotals = Papa.unparse(csvTotalDataRows, { columns: columns, quotes: true });

//     const issueColumns = ['Repo', 'Label', 'Issue Number', 'Title', 'Status'];
//     const csvIssues = Papa.unparse(csvIssueDataRows, { columns: issueColumns, quotes: true });

//     return {csvTotals, csvIssues};
// }


// async function getIssues(reqHeaders, URL, jsonURL) {
//     let issues = [];
//     for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
//         console.log(`Requesting page ${pageNum} from the GitHub API...`);
//         let response = await getUrl(URL + `/issues?state=all`, {
//             params: {
//                 page: pageNum,
//                 per_page: 100
//             },
//             headers: reqHeaders,
//         });
//         let headers = response.headers;
//         let data = response.data;
//         if (data.length === 0) {
//             console.log('Reached last page.');
//             break;
//         }
//         issues.push(...response.data);
//         printLimits(headers);
//     }

//     console.log(`Found ${issues.length} issues in total.`);
//     let outPath = path.join(OUTPUT_DIR, jsonURL);
//     await fs.writeFileSync(outPath, JSON.stringify(issues));
//     console.log(`Wrote raw output to ${outPath}`);
//     return issues;
// }



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

function outputCsv(csv, downloadURL) {
    let outPath = path.join(OUTPUT_DIR, downloadURL);
    fs.writeFileSync(outPath, csv);
    // fs.writeFile(outPath, csv, { encoding: 'utf-8' });
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

async function getUrl(url, params) {
    try {
        const response = await axios.get(url, params);
        if (typeof response.data !== 'object') {
            console.warn('API didn\'t return JSON. Did it change since this script was written? Maybe tweak the provided headers in getHeaders().');
            process.exit(1);
        }
        return response;
    }
    catch (err) {
        if (err instanceof axios.AxiosError) {
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

