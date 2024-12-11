const Papa = require('papaparse');
const path = require('path');
const fs = require('fs');
const { getHeaders,
    outputCsv,
    printLimits,
    getUrl} = require('./lib/index');

const MAX_PAGES = 20;
const OUTPUT_DIR = path.join(__dirname, 'download-repo-issues');

const Repos = [
    {
        name: 'AMO-Tools-Desktop',
        ignoreLabels: [
            "dependencies",
            "Needs Review",
            "Needs Verification",
            "To Do",
            "In Progress",
            "Completed",
            "Epic"
        ]
    },
    {
        name: 'AMO-Tools-Suite',
        ignoreLabels: [
            "dependencies",
            "Needs Review",
            "Needs Verification",
            "In Progress",
            "Completed",
            "Epic"
        ]
    },
    {
        name: 'VERIFI',
        ignoreLabels: [
            "dependencies",
            "Epic"
        ]
    },
]

main();

async function main() {

    if (!fs.existsSync(OUTPUT_DIR)) {
        console.log('Output directory does not exist. Creating...');
        fs.mkdirSync(OUTPUT_DIR);
    } 
    const headers = getHeaders();
    const {totalsCsv, issuesCsv} = await buildIssueStatsCSVs(headers);

    outputCsv(totalsCsv, 'ORNL_repo_total_issues.csv', OUTPUT_DIR);
    outputCsv(issuesCsv, 'ORNL_repo_issues.csv', OUTPUT_DIR);
}

async function getRepoLabels(reqHeaders, repoName) {
    let labels = [];
    for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
        const URL = `https://api.github.com/repos/ORNL-AMO/${repoName}/labels`;
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
        labels.push(...response.data);
        printLimits(headers);
    }

    console.log(`=== Retrieved ${labels.length} for ${repoName}`)
    return labels;
}

async function getRepoIssuesByLabel(reqHeaders, repoName, label, repoOutputFilePath) {
    let issues = [];
    for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
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

        let repoLabels = await getRepoLabels(headers, repo.name);
        repoLabels = repoLabels.filter(label => !repo.ignoreLabels.includes(label.name));
        for await (let label of repoLabels) {
            const issues = await getRepoIssuesByLabel(headers, repo.name, label.name, repoOutFile);
            let labelTotalRowData = {
                'Repo': repo.name,
                'Label': label.name,
                'Total Issues': issues.length,
                'Total Open': 0,
                'Total Closed': 0
            }

            repoTotalRow['Total Issues'] += issues.length;
            for (let issue of issues) {
                let issueRowData = {
                    'Repo': repo.name,
                    'Label': label.name,
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

