const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const inputFolderPath = path.join(__dirname, 'scores');
const outputFolderPath = path.join(__dirname, 'scorestxt');

fs.readdir(inputFolderPath, (err, files) => {
  if (err) {
    console.error("Could not list the directory.", err);
    return; // Stop execution if directory listing fails
  }

  let counter = 1;
  const datePrefix = new Date().toISOString().slice(0, 10);

  files.forEach(file => {
    const inputFilePath = path.join(inputFolderPath, file);

    if (/\.(jpg|jpeg|png|bmp)$/i.test(file)) {
      try {
        Tesseract.recognize(
          inputFilePath,
          'eng',
          { logger: m => console.log(m) }
        ).then(({ data: { text } }) => {
          const outputFileName = `${datePrefix}_${counter}.txt`;
          const outputFilePath = path.join(outputFolderPath, outputFileName);

          fs.writeFile(outputFilePath, text, err => {
            if (err) {
              console.error(`Error writing text for ${file}:`, err);
              return; // Optionally, stop processing further
            }

            console.log(`Successfully wrote text for ${file} to ${outputFileName}`);
            fs.unlink(inputFilePath, err => {
              if (err) {
                console.error(`Error deleting ${file}:`, err);
              } else {
                console.log(`Successfully deleted ${file}`);
              }
            });
          });

          counter++;
        }).catch(err => {
          console.error(`OCR processing failed for ${file}:`, err);
          // Decide whether to continue or stop. Here, we simply log and continue.
        });
      } catch (err) {
        console.error(`An unexpected error occurred during OCR processing for ${file}:`, err);
        // Optionally, stop processing or continue to the next file
      }
    }
  });
});
