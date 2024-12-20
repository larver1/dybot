const fs = require('fs');
const dbConfig = JSON.parse(fs.readFileSync('./config/config.json'));
const { execSync } = require('child_process');
const { debug } = require('./config.json');

const backupName = `./backups/backup.sql`;

if(!debug) {
  console.log("You cannot restore DB on live");
  return;
}

try {
    execSync(`mysql -u ${dbConfig.development.username} -p${dbConfig.development.password} --quick --max_allowed_packet=50MB --compress ${dbConfig.development.database} < ${backupName}`);
    console.log('Database restored successfully.');
  } catch (error) {
    console.error('Error restoring database:', error);
}