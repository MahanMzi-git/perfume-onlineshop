import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {inflateSync} from 'node:zlib';import {createHash} from 'node:crypto';
test('Losslessly recompressed audience icon retains the approved original PNG scanlines',()=>{
 const svg=fs.readFileSync('public/images/audience/unisex.svg','utf8');assert.ok(Buffer.byteLength(svg)<500000);
 const match=svg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);assert.ok(match);const png=Buffer.from(match[1],'base64'),idat=[];
 assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),1254);assert.equal(png.readUInt32BE(20),1254);
 for(let offset=8;offset<png.length;){const size=png.readUInt32BE(offset),type=png.subarray(offset+4,offset+8).toString();if(type==='IDAT')idat.push(png.subarray(offset+8,offset+8+size));offset+=size+12;}
 const hash=createHash('sha256').update(inflateSync(Buffer.concat(idat))).digest('hex');assert.equal(hash,'7ee5e93b479fdd13ba93c8a50402f0ac7823bb70fb1ad82f6318675b1162d7ec');
});
