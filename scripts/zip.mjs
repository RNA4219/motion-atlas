// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import {deflateRawSync} from 'node:zlib';
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
export function crc32(data){let crc=0xffffffff;for(const value of data)crc=crcTable[(crc^value)&255]^(crc>>>8);return(crc^0xffffffff)>>>0;}
export function makeZip(entries){
  const local=[],central=[];let offset=0;
  for(const [name,value] of entries){
    if(name.startsWith('/')||name.includes('..')||name.includes('\\'))throw new Error('不正なZIPパス: '+name);
    const path=Buffer.from(name),data=Buffer.isBuffer(value)?value:Buffer.from(value),packed=deflateRawSync(data),crc=crc32(data);
    const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt16LE(23876,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(packed.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(path.length,26);local.push(header,path,packed);
    const record=Buffer.alloc(46);record.writeUInt32LE(0x02014b50);record.writeUInt16LE(20,4);record.writeUInt16LE(20,6);record.writeUInt16LE(0x800,8);record.writeUInt16LE(8,10);record.writeUInt16LE(23876,14);record.writeUInt32LE(crc,16);record.writeUInt32LE(packed.length,20);record.writeUInt32LE(data.length,24);record.writeUInt16LE(path.length,28);record.writeUInt32LE(offset,42);central.push(record,path);offset+=header.length+path.length+packed.length;
  }
  const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...local,directory,end]);
}
