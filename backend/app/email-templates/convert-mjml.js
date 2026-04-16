const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const languages = ['en', 'ja', 'th', 'vi'];
const inputRoot = path.join(__dirname, 'src');
const outputRoot = path.join(__dirname, 'build');

if (!fs.existsSync(outputRoot)) {
  fs.mkdirSync(outputRoot, { recursive: true });
}

languages.forEach((lang) => {
  const inputDir = path.join(inputRoot, lang);
  const outputDir = path.join(outputRoot, lang);

  if (!fs.existsSync(inputDir)) {
    console.log(`Skip missing folder: ${inputDir}`);
    return;
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.readdir(inputDir, (err, files) => {
    if (err) {
      console.log(`Unable to scan directory ${inputDir}: ${err}`);
      return;
    }

    const mjmlFiles = files.filter((file) => path.extname(file) === '.mjml');

    if (mjmlFiles.length === 0) {
      console.log(`No MJML files found in: ${inputDir}`);
      return;
    }

    mjmlFiles.forEach((file) => {
      const inputFilePath = path.join(inputDir, file);
      const outputFilePath = path.join(outputDir, file.replace('.mjml', '.html'));

      exec(`mjml "${inputFilePath}" -o "${outputFilePath}"`, (err, stdout, stderr) => {
        if (err) {
          console.log(`Error converting ${file}: ${err.message}`);
          if (stderr) console.log(stderr);
          return;
        }

        console.log(`Converted ${lang}/${file} -> ${lang}/${file.replace('.mjml', '.html')}`);
      });
    });
  });
});