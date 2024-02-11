const fs = require('fs');
const path = require('path');

// Directories
const inputDirectoryPath = path.join(__dirname, 'scorestxt');
const outputDirectoryPath = path.join(__dirname, 'parse');

// Ensure the output directory exists
if (!fs.existsSync(outputDirectoryPath)) {
    fs.mkdirSync(outputDirectoryPath, { recursive: true });
}

// Function to parse OCR results
function parseOcrResults(ocrText) {
    const playerScores = [];
    const pattern = /^([A-Za-z]+)\s+(\d+)\s+(\d+)\s+\d+\s+\d+\s+(\d+)$/gm;

    let match;
    while ((match = pattern.exec(ocrText)) !== null) {
        playerScores.push({
            name: match[1],
            game1: parseInt(match[2], 10),
            game2: parseInt(match[3], 10),
            total: parseInt(match[4], 10)
        });
    }

    return playerScores;
}

// Function to generate a unique filename if the target file already exists
function generateUniqueFilename(basePath, originalName) {
    let counter = 1;
    let uniqueName = originalName;

    while (fs.existsSync(path.join(basePath, uniqueName))) {
        // Append a counter to the filename to make it unique
        const [name, ext] = originalName.split('.');
        uniqueName = `${name}_${counter}.${ext}`;
        counter++;
    }

    return uniqueName;
}

// Read and parse all text files in the directory
fs.readdir(inputDirectoryPath, (err, files) => {
    if (err) {
        console.error('Error listing the directory:', err);
        return;
    }

    files.forEach(file => {
        if (path.extname(file) === '.txt') {
            const inputFilePath = path.join(inputDirectoryPath, file);
            // Generate a unique filename for the output to avoid overwriting
            let outputFileName = `Parsed_${file}`;
            outputFileName = generateUniqueFilename(outputDirectoryPath, outputFileName);
            const outputFilePath = path.join(outputDirectoryPath, outputFileName);

            fs.readFile(inputFilePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading the file: ${file}`, err);
                    return;
                }

                const playerScores = parseOcrResults(data);
                const outputContent = playerScores.map(player => `${player.name} - Game 1: ${player.game1}, Game 2: ${player.game2}, Total Score: ${player.total}`).join('\n');

                // Write the parsed results to a uniquely named file in the "parse" directory
                fs.writeFile(outputFilePath, outputContent, (err) => {
                    if (err) {
                        console.error(`Error writing to file: ${outputFilePath}`, err);
                        return;
                    }
                    console.log(`Parsed results saved to ${outputFilePath}`);
                });
            });
        }
    });
});
