import { readFileSync, existsSync } from 'fs';
import uniqueId from 'lodash.uniqueid';

export enum Types {
    readIntLE = 'readIntLE',
    readUIntLE = 'readUIntLE'
}

export const Read = {
    key        : String,
    int8       : Function,
    int4       : Function,
    int2       : Function,
    int1       : Function,
    uInt8      : Function,
    uInt4      : Function,
    uInt2      : Function,
    uInt1      : Function,
    isEnd      : Function,
    skip       : Function,
    setPosition: Function,
    getPosition: Function
};

class BinReader {

    private _buffer: Buffer | null = null;
    private _position: {
        [key: string]: number
    } = {};

    constructor(filePath: string | Buffer) {
        if(typeof filePath === 'string') {
            if(existsSync(filePath)) {
                this.buffer = readFileSync(filePath);
            } else {
                console.error('File `%s` not found.', filePath);
            }
        } else if(Buffer.isBuffer(filePath)) {
            this.buffer = filePath;
        }
    }

    set buffer(buffer: Buffer | null) {
        this._buffer = buffer;
    }

    get buffer(): Buffer | null {
        return this._buffer;
    }

    setPosition(key: string, position: number = 0): void {
        this._position[key] = position;
    }

    getPosition(key: string): number | undefined {
        return this._position[key];
    }

    skip(key: string, BYTE: number): void {
        const position = this.getPosition(key);

        if(typeof position === 'number' && typeof BYTE === 'number') {
            this.setPosition(key, position + BYTE);
        } else {
            console.log('Incorrect argument value `position: %n` or `BYTE: %n`', position, BYTE);
        }
    }

    isEnd(key: string): boolean {
        const position = this.getPosition(key);

        if(this.buffer && this.buffer.length && typeof position === 'number') {
            return this.buffer.length <= position;
        } else {
            console.log('Incorrect `position: %n` or `buffer: %s`', position, this.buffer);
        }

        return false;
    }

    read(key: string): { [key: string]: Function | String } {
        if(!key) {
            key = uniqueId('read-');
        }

        this.setPosition(key);

        return {
            key        : key,
            int8       : this.int.bind(this, key, Types.readIntLE, 8),
            int4       : this.int.bind(this, key, Types.readIntLE, 4),
            int2       : this.int.bind(this, key, Types.readIntLE, 2),
            int1       : this.int.bind(this, key, Types.readIntLE, 1),
            uInt8      : this.int.bind(this, key, Types.readUIntLE, 8),
            uInt4      : this.int.bind(this, key, Types.readUIntLE, 4),
            uInt2      : this.int.bind(this, key, Types.readUIntLE, 2),
            uInt1      : this.int.bind(this, key, Types.readUIntLE, 1),
            isEnd      : this.isEnd.bind(this, key),
            skip       : this.skip.bind(this, key),
            setPosition: this.setPosition.bind(this, key),
            getPosition: this.getPosition.bind(this, key),
        };
    }

    int(key: string, type: Types = Types.readIntLE, BYTE: number): number | null {
        const position = this.getPosition(key);

        if(typeof position === 'number' && typeof BYTE === 'number') {
            this.setPosition(key, position + BYTE);

            if(this.buffer !== null) {
                this.buffer[type](position, BYTE, true);
            } else {
                console.log('Incorrect buffer === null');
            }
        } else {
            console.log('Incorrect argument value `position: %n` or `BYTE: %n`', position, BYTE);
        }

        return null;
    }

}

export default BinReader;
