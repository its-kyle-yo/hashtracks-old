const concurrently = require(`concurrently`)

concurrently([
  { command: `redis-server`, name: `REDIS`, prefixColor: `red` },
  { command: `npm start`, name: `SERVER`, prefixColor: `green` },
  { command: `redis-cli monitor`, name: `REDIS-MONITOR`, prefixColor: `blue` },
])
