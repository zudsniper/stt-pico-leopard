// hello 
const fs = require('fs');
const path = require('path');
const chalk = require('chalk')

const Leopard = require('@picovoice/leopard-node');

// env vars
require('dotenv').config();

const ACCESS_KEY = process.env.ACCESS_KEY;
const SEARCH = process.env.SEARCH ? process.env.SEARCH : path.join(__dirname, "input");
const TRANSCRIPTS = process.env.TRANSCRIPTS ? process.env.TRANSCRIPTS : path.join(__dirname, "transcripts");

const excludePaths = process.env.EXCLUDE ? process.env.EXCLUDE.split(',') : [];

// make sure folders & files exist
fs.mkdirSync(path.join(__dirname, "input"), {recursive: true});
fs.mkdirSync(TRANSCRIPTS, {recursive: true});

// helper functions 
function isExcludedPath(filePath, excludePaths) {
  return excludePaths.some(excludePath => {
    const resolvedExcludePath = path.resolve(excludePath);
    const resolvedFilePath = path.resolve(filePath);
    return resolvedFilePath.startsWith(resolvedExcludePath);
  });
}

function iterateDirectoryRecursively(directoryPath, excludePaths, f) {
  const files = fs.readdirSync(directoryPath);

  files.forEach(file => {
    const filePath = path.join(directoryPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      if (!isExcludedPath(filePath, excludePaths)) {
        iterateDirectoryRecursively(filePath, excludePaths);
      }
    } else {
      f(filePath);
      console.log(filePath);
    }
  });
}



const rootDirectoryPath = path.dirname(require.main.filename);
console.log('Root Directory Path:', rootDirectoryPath);

console.log(chalk.blue.italic("starbucks2 stt test"));
//const accessKey = "${ACCESS_KEY}" // Obtained from the Picovoice Console (https://console.picovoice.ai/)
let handle = new Leopard(ACCESS_KEY, {enableAutomaticPunctuation: true});

iterateDirectoryRecursively(SEARCH, EXCLUDE, (fp) => {
    console.log(`PROCESSING ${fp}`);
    const result = handle.processFile(fp);
    const o_filename = path.parse(fp).base.split(".")[0] + '.txt';
    console.log(` [DEBUG] o_filename: ${o_filename}`);
    const output = path.join(TRANSCRIPTS, o_filename);
    const text = result.transcript;
    console.log(`${text}\n  ➖  \n`);
    fs.writeFileSync(output, text, {encoding: 'utf8', flag:'w'});
    console.log(`WROTE TO OUTPUT FILE ✅\n\n`); 
});

// const result = engineInstance.processFile('${AUDIO_PATH}');
// console.log(result.transcript);
