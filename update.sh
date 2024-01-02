#!/bin/bash

echo "Running network map";
cd _networkmap;
node generate.js;

echo "Running word cloud";
cd ..;
cd _wordcloud;
node extract.js;