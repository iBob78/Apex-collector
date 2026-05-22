
const fs = require('fs');
const readline = require('readline');

async function searchHistory() {
    const fileStream = fs.createReadStream('C:/Apex-collector/copilot-activity-history (2).csv');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    console.log('--- Searching history for circuits ---');
    for await (const line of rl) {
        if (line.toLowerCase().includes('circuit') && (line.toLowerCase().includes('table') || line.toLowerCase().includes('database') || line.toLowerCase().includes('user_cards'))) {
            console.log(`Match at line: ${line.slice(0, 300)}...`);
            count++;
            if (count > 20) break;
        }
    }
}

searchHistory();
