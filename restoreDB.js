const fs = require('fs');
const dbConfig = JSON.parse(fs.readFileSync('./config/config.json'));
const { execSync } = require('child_process');
const backupName = `./backups/backup.sql`;

try {
    execSync(`mysql -u ${dbConfig.development.username} -p${dbConfig.development.password} --quick --max_allowed_packet=50MB --compress ${dbConfig.development.database} < ${backupName}`);
    console.log('Database restored successfully.');
  } catch (error) {
    console.error('Error restoring database:', error);
}