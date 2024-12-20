const { execSync } = require('child_process');

try {
    execSync(`npx sequelize-cli db:migrate`);
    console.log('Database migrated successfully.');
  } catch (error) {
    console.error('Error migrating database:', error);
  }