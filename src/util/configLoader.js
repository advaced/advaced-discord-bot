import fs from 'fs';

const configPath = './config.json';

const laodConfig = new Promise((resolve, reject) => {
  fs.readFile(configPath, 'utf8', (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(JSON.parse(data));
    }
  });
});

export default laodConfig;
