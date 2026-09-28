import fs from 'node:fs'
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist',{recursive:true});
for(const file of ['index.html','app.js','styles.css','favicon.svg'])fs.copyFileSync(`src/${file}`,`dist/${file}`)
fs.cpSync('src/domain','dist/domain',{recursive:true});fs.cpSync('src/game','dist/game',{recursive:true});fs.cpSync('src/ui','dist/ui',{recursive:true});fs.cpSync('src/storage','dist/storage',{recursive:true});
fs.cpSync('src/assets','dist/assets',{recursive:true});
