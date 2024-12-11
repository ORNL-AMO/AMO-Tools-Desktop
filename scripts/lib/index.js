const axios = require('axios');
const path = require('path');
const fs = require('fs');

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

function outputCsv(csv, downloadURL, outputDir) {
    let outPath = path.join(outputDir, downloadURL);
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


function getNumber(thing) {
    return parseFloat(String(thing));
}


module.exports = {
    getHeaders,
    outputCsv,
    printLimits,
    getUrl,
    getNumber
}