
mkdir Babel/Build

Babel/node_modules/.bin/babel Source --out-dir Babel/Build --minified

browserify Babel/Build/Mod.js -p esmify > scripts/main.js
