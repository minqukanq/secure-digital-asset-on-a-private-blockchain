/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.db = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    // Auxiliar method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock(){
        let self = this;
        return this.db.getBlocksCount().then(function(height) {
            if (height === 0) {
                console.log('\nGenesis Block being created...');
                let genesisBlock = new Block.Block('Genesis Block');
                genesisBlock.time = new Date().getTime().toString().slice(0,-3);
                genesisBlock.height = height;
                genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();
                console.log( genesisBlock );
                return self.db.addLevelDBData(0, genesisBlock)
            } else {
                console.log('\nGenesis Block already exists');
            }
        })
    }

    // Get block height, it is auxiliar method that return the height of the blockchain
    getBlockHeight() {
        return this.db.getBlocksCount();
    }

    // Add new block
    addBlock(newBlock) { 
        let self = this;
        newBlock.time = new Date().getTime().toString().slice(0,-3);
        return this.getBlockHeight()
            .then(async function(height) {
                newBlock.height = height;
                return await self.db.getLevelDBData(height-1);
            })
            .then(lastBlock => {
                newBlock.previousBlockHash = lastBlock.hash;
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                return newBlock;
            })
            .then(function(newBlock) {
                return self.db.addLevelDBData(newBlock.height, newBlock)
        })
    }

    // Get Block By Height
    async getBlock(height) {
        return await this.db.getLevelDBData(height);
    }

    // Get block by hash
    async getBlockByHash(hash) {
        return await this.db.getLevelDBDataByHash(hash);
    }

    // Get block by walletAddress
    async getBlockByWalletAddress(walletAddress) {
        return await this.db.getLevelDBDataByWalletAddress(walletAddress);
    }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        return this.db.getLevelDBData(height).then(function(result) {
            let block = result;
            let blockHash = block.hash;
            block.hash = ''; // removing hash so that block can be rehashed w/o hash contents
            let validBlockHash = SHA256(JSON.stringify(block)).toString();
            if (blockHash !== validBlockHash) {
                console.log('Block # ' + height + ' invalid hash:\n' + blockHash + ' <> ' + validBlockHash);
                return false;
            } else {
                console.log('\nBlock #' + height + ' valid!')
                return true;
            }
        })
    }

    // Validate Blockchain
    validateChain() {
        let errorLog = [];
        let blockHash = '';
        let previousHash = '';
        let self = this;
        return this.db.getBlocksCount()
            .then(function(result) {
                for (let i = 0; i < result; i++) {
                    console.log('Checking Block #' + i + ' --');
                    if (!self.validateBlock(i)) {
                        console.log('Block # ' + i + ' problem!');
                        errorLog.push(i);
                    }
                if (i > 0) {
                    Promise.all([self.db.getLevelDBData(i-1), self.db.getLevelDBData(i)])
                    .then(result => {
                        previousHash = result[0].hash;
                        blockHash = result[1].previousBlockHash
                    }).catch(error => console.log(error.message))
                }
                if (blockHash !== previousHash) errorLog.push(i+1);
            }
            if (errorLog.length > 0) {
                console.log('Block errors = ' + errorLog.length);
                console.log('Blocks: ' + errorLog);
            } else {
                console.log('No errors detected');
            }
            return errorLog;
        })
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.addLevelDBData(height, block).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }
   
}

module.exports.Blockchain = Blockchain;