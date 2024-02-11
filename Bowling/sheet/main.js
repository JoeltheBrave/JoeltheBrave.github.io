const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

async function main() {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json', // Ensure this path is correct for your service account credentials
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const spreadsheetId = '1rbEMm_e6kgJ91JOqMi4j3LIiGQmxD_lnlmvSlJZrGSA'; // Replace with your actual spreadsheet ID
    const scoresDirectoryPath = path.join(__dirname, 'scored'); // Directory containing the score files

    const files = fs.readdirSync(scoresDirectoryPath).filter(file => file.endsWith('.txt'));

    for (const file of files) {
        const filePath = path.join(scoresDirectoryPath, file);
        const playerScores = readScoresFromFile(filePath);
        await updateGoogleSheet(sheets, spreadsheetId, playerScores);
    }
}

function readScoresFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    const scores = {};

    lines.forEach(line => {
        const parts = line.split(' - ');
        const player = parts[0];
        const gameScores = parts.slice(1).map(part => {
            const match = part.match(/Game (\d+): (\d+)/);
            if (match) {
                const [, gameNumber, score] = match;
                return { [gameNumber]: score };
            }
            return null;
        }).filter(score => score !== null);

        const playerScores = {};
        gameScores.forEach(score => {
            const gameNumber = Object.keys(score)[0];
            const gameScore = Object.values(score)[0];
            playerScores[`game${gameNumber}`] = gameScore;
        });

        scores[player] = playerScores;
    });

    return scores;
}

async function updateGoogleSheet(sheets, spreadsheetId, playerScores) {
    const existingPlayersResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1!A1:A',
    });
    const existingPlayers = existingPlayersResponse.data.values ? existingPlayersResponse.data.values.flat() : [];

    const updates = [];
    const newPlayers = [];

    for (const [player, scores] of Object.entries(playerScores)) {
        const rowIndex = existingPlayers.indexOf(player) + 1; // Adjust for 0-based index
        const playerRowValues = [];
        if (rowIndex >= 0) {
            // Player exists, prepare their scores for update
            playerRowValues.push(scores.game1 || 'N/A');
            playerRowValues.push(scores.game2 || 'N/A');
            playerRowValues.push(scores.game3 || 'N/A');

            const nextAvailableColumnRange = `Sheet1!A${rowIndex}`;
            updates.push({ range: nextAvailableColumnRange, values: [[playerRowValues[0]], [playerRowValues[1]], [playerRowValues[2]]] });
        } else {
            // New player, prepare for appending
            newPlayers.push([player, scores.game1 || 'N/A', scores.game2 || 'N/A', scores.game3 || 'N/A']);
        }
    }

    // Batch update existing player scores
    if (updates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId,
            resource: {
                valueInputOption: 'USER_ENTERED',
                data: updates,
            },
        });
    }

    // Append new players and their scores
    if (newPlayers.length > 0) {
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1',
            valueInputOption: 'USER_ENTERED',
            resource: { values: newPlayers },
        });
    }

    console.log('Google Sheet updated successfully.');
}

main().catch(console.error);
