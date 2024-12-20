const fs = require('fs');
const dbConfig = JSON.parse(fs.readFileSync('./config/config.json'));
const { execSync } = require('child_process');

const dumpFileName = `./backups/backup.sql.gz`;

try {
    execSync(`mysqldump -u ${dbConfig.development.username} -p${dbConfig.development.password} ${dbConfig.development.database} --single-transaction --routines --triggers | gzip > ${dumpFileName}`);
    console.log('Database dumped successfully.');
  } catch (error) {
    console.error('Error dumping database:', error);
  }