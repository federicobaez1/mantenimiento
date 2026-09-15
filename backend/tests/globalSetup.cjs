const { execSync } = require('node:child_process')

module.exports = function globalSetup() {
  const url =
    process.env.TEST_DATABASE_URL ?? 'mysql://root:prueba@localhost:3306/mantenimiento_test'
  process.env.DATABASE_URL = url

  execSync('npx prisma migrate deploy', {
    cwd: __dirname + '/..',
    env: process.env,
    stdio: 'inherit',
  })
}