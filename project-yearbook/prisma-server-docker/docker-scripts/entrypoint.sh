#!/bin/sh

# Wait until prisma is avaliable, and download schemas
./docker-scripts/wait-for-it.sh prisma:4466 -- prisma deploy -p src/prisma/prisma.yml 

if [ $DEBUG = 1 ]; then

  echo "Running in debug mode"
  current_dir=$PWD
  cd src/prisma
  prisma generate
  cd $current_dir

  npm run dev --delay 2.5

else

  echo "Running in production mode"
  npm run build 
  node dist/app.js

fi