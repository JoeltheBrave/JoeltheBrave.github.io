const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

// Input and output directories for OCR process
const inputFolderPath = path.join(__dirname, 'scores');
const intermediateFolderPath = path.join(__dirname, 'scorestxt');

// Output directory for parsed results
const outputDirectoryPath = path.join(__dirname, 'parse');

// Ensure intermediate and output directories exist
if (!fs.existsSync(intermediateFolderPath)) fs.mkdirSync(intermediateFolderPath, { recursive: true });
if (!fs.existsSync(outputDirectoryPath)) fs.mkdirSync(outputDirectoryPath, { recursive: true });

// Process images with OCR and save text
function processImagesWithOCR() {
  fs.readdir(inputFolderPath, (err, files) => {
    if (err) return console.error("Could not list the directory.", err);
    let counter = 1;
    const datePrefix = new Date().toISOString().slice(0, 10);

    files.forEach(file => {
      const inputFilePath = path.join(inputFolderPath, file);
      if (/\.(jpg|jpeg|png|bmp)$/i.test(file)) {
        Tesseract.recognize(inputFilePath, 'eng', { logger: m => console.log(m) })
          .then(({ data: { text } }) => {
            const outputFileName = `${datePrefix}_${counter}.txt`;
            const outputFilePath = path.join(intermediateFolderPath, outputFileName);
            fs.writeFile(outputFilePath, text, err => {
              if (err) return console.error(`Error writing text for ${file}:`, err);
              console.log(`Successfully processed ${file}, results saved to ${outputFileName}`);
              fs.unlink(inputFilePath, err => err && console.error(`Error deleting ${file}:`, err));
              counter++;
            });
          })
          .catch(err => console.error(`OCR processing failed for ${file}:`, err));
      }
    });
  });
}

// Parse OCR results and save parsed data
function parseAndSaveResults() {
  fs.readdir(intermediateFolderPath, (err, files) => {
    if (err) return console.error('Error listing the directory:', err);

    files.forEach(file => {
      if (path.extname(file) === '.txt') {
        const inputFilePath = path.join(intermediateFolderPath, file);
        fs.readFile(inputFilePath, 'utf8', (err, data) => {
          if (err) return console.error(`Error reading the file: ${file}`, err);

          const playerScores = parseOcrResults(data);
          const outputContent = playerScores.map(player => `${player.name} - Game 1: ${player.game1}, Game 2: ${player.game2}, Total Score: ${player.total}`).join('\n');
          const outputFileName = generateUniqueFilename(outputDirectoryPath, `Parsed_${file}`);
          const outputFilePath = path.join(outputDirectoryPath, outputFileName);

          fs.writeFile(outputFilePath, outputContent, err => {
            if (err) return console.error(`Error writing to file: ${outputFilePath}`, err);
            console.log(`Parsed results saved to ${outputFilePath}`);
          });
        });
      }
    });
  });
}

// Start the OCR process, then parse results
processImagesWithOCR();
setTimeout(parseAndSaveResults, 5000); // Adjust delay as needed based on OCR processing time

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

function generateUniqueFilename(basePath, originalName) {
  let counter = 1;
  let uniqueName = originalName;
  while (fs.existsSync(path.join(basePath, uniqueName))) {
    const [name, ext] = originalName.split('.');
    uniqueName = `${name}_${counter}.${ext}`;
    counter++;
  }
  return uniqueName;
}
