#!/bin/sh
echo "Creating necessary folders"
mkdir ./static
mkdir ./static/images
mkdir ./static/css
mkdir ./static/js
mkdir ./views
mkdir ./models
mkdir ./test

echo "Copying Markup and CSS BoilerPlate..."
mv ./templates/app/server.js ./server.js
mv ./templates/app/package.json ./package.json
mv ./templates/app/.gitignore ./.gitignore
mv ./templates/app/config.json ./config.json
mv ./templates/app/Makefile ./Makefile
mv ./templates/test/stub.js ./test/stub.js
curl https://raw.github.com/h5bp/html5-boilerplate/master/css/style.css > ./static/css/style.css
mv ./templates/views/500.jade ./views/500.jade
mv ./templates/views/404.jade ./views/404.jade
mv ./templates/views/index.jade ./views/index.jade
mv ./templates/views/layout.jade ./views/layout.jade
mv ./templates/js/script.js ./static/js/script.js
# TODO copy over the models

echo "Setting up the dependencies from NPM..."
npm install

echo "Removing the stuff you dont want..."
rm -rf .git
rm -rf templates
rm README.md
rm -rf initproject.sh

echo "Initing the new git project..."
git init
git add .
git commit -m"Initial Commit"

