const { execSync } = require('child_process');

try {
  console.log('Running irrigation service tests...\n');
  execSync('npm test -- --testPathPattern=irrigation.service.spec --runInBand --no-coverage', {
    stdio: 'inherit',
    cwd: __dirname
  });
} catch (error) {
  process.exit(error.status || 1);
}
