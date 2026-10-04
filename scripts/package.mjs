// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {makeZip} from './zip.mjs';
import {catalog} from '../src/catalog.js';
const root=fileURLToPath(new URL('..',import.meta.url));
const entries=[];
async function collect(relative){
  const absolute=path.join(root,relative),stat=await fs.stat(absolute);
  if(stat.isDirectory()){for(const name of (await fs.readdir(absolute)).sort())await collect(relative+'/'+name);}
  else entries.push(['motion-atlas/'+relative,await fs.readFile(absolute)]);
}
for(const item of ['src','scripts','tests','dist','reports','agents','.github','index.html','styles.css','studio.css','favicon.svg','package.json','package-lock.json','LICENSE','README.md','REQUIREMENTS.md','WORKLOG.md','SKILL.md','CONTRIBUTING.md','CHANGELOG.md','.gitignore','.gitattributes'])await collect(item);
const verification=JSON.parse(await fs.readFile(path.join(root,'reports/verification.json'),'utf8'));
const artifacts=JSON.parse(await fs.readFile(path.join(root,'reports/artifacts.json'),'utf8'));
if(verification.rendered!==catalog.length||verification.failures.length||artifacts.skill_zips_checked!==catalog.length||artifacts.failures.length)throw new Error('検証レポートを確認してください');
const version=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')).version;
const data=makeZip(entries),name=`motion-atlas-${version}.zip`,checksum=createHash('sha256').update(data).digest('hex');
await fs.mkdir(path.join(root,'release'),{recursive:true});await fs.writeFile(path.join(root,'release',name),data);await fs.writeFile(path.join(root,'release','SHA256SUMS'),checksum+'  '+name+'\n');
console.log(JSON.stringify({file:path.join(root,'release',name),files:entries.length,bytes:data.length,sha256:checksum}));
