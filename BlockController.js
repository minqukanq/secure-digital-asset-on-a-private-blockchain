const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js');
const BlockChain = require('./BlockChain.js');
const Mempool = require('./memPool.js');
const hex2ascii = require('hex2ascii');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.blockChain = new BlockChain.Blockchain();
        this.memPool = new Mempool.Mempool();
        
        this.getBlockByIndex();
        this.postNewBlock();
        this.postValidationRequest();
        this.messageSignatureValidation();
        this.postBlock();
        // this.starRequestValidation();
        this.getStarBlockByHash();
        this.getBlockByWalletAddress();
        this.getStarBlockByHeight();
        //this.initializeMockData();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        let self = this;
        this.app.get("/api/block/:blockHeight", (req, res) => {
            return self.blockChain.getBlock(req.params.blockHeight).then(result => {
                res.set({'Connection': 'close'});
                res.status(200).json(JSON.parse(result));
                res.end();
                }, error => {
                    res.status(404).send('Block not found!\n\n');
            });
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        let self = this;
        this.app.post("/api/block", (req, res) => {
            if (req.body.body) {
                return self.blockChain.addBlock(new BlockClass.Block(req.body.body)).then(result => {
                    res.status(201).json( JSON.parse(result) );
                }, error => {
                    res.status(500).send('Uknown error occurred on server side. Please retry later.\n\n')
                })
            } else {
                res.status(403).send('Block data must not be empty - please resend request with json object containing desired block data.\n\n')
            }
        });
    }

    // Post validation request
    postValidationRequest() {
        let self = this;
        self.app.post("/requestValidation", (req, res) => {
            self.memPool.addRequestValidation(req)
            .then(result => {
                return res.status(201).json( result );
            });
        })
    }

    messageSignatureValidation(){
        let self = this;
        this.app.post("/message-signature/validate", (req, res) => {
            self.memPool.validateWalletSignature(req)
            .then(result => {
                return res.status(201).json( result )
            }).catch(err => {
                console.log(err);
                res.status(403).send('Message signature invalid. Please resend correct message signature.')})
        })
    }

    postBlock(){
        let self = this;
        this.app.post('/block/', (req, res) => {
            if (req.body.length){
                res.status(403).send("You sent " + req.body.length + " stars. Only one star per request is allowed!");
            } else {
                let story = req.body.star.story;
                let words = story.match(/\S+/g).length;
                if (words > 250){
                    res.status(403).send("You sent more than 250 words!");
                }
            }

            let isDataThere = self.memPool.validateAddressRequest(req.body.address) && req.body.star.ra && req.body.star.dec && req.body.star.story;
            if (isDataThere) {
                let body = {
                    address: req.body.address,
                    star: {
                        ra: req.body.star.ra,
                        dec: req.body.star.dec,
                        story: new Buffer.from(req.body.star.story).toString('hex')
                    }
                }
                self.blockChain.addBlock(new BlockClass.Block(body))
                .then(result => {
                    result.body.star.storyDecoded = hex2ascii(result.body.star.story);
                    console.log(result)
                    res.status(201).json( result )
                }).catch(err => {
                    res.status(403).send('Star block could not be created at this time. Please attempt addition at a later time.')
                })
            } else {
                return res.status(403).send('Error: submitted wallet address has not been validated for star registry or star data not included in star addition request.')
            }
        })
    }

    getStarBlockByHash() {
        let self = this;
        this.app.get('/stars/hash/:hash', (req, res) => {
            self.blockChain.getBlockByHash(req.params.hash)
            .then(result => {
                if (result !== null) {
                    result.body.star.storyDecoded = hex2ascii(result.body.star.story);
                    res.status(200).json( result );
                } else {
                    throw new Error;
                }
            }).catch(err => {
                res.status(403).send(`Star block with hash: "${req.params.hash}" not found`)
            })
        })
    }

    getBlockByWalletAddress() {
        let self = this;
        this.app.get('/stars/address/:address', (req, res) => {
            self.blockChain.getBlockByWalletAddress(req.params.address)
            .then(result => {
                if (result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        result[i].body.star.storyDecoded = hex2ascii(result[i].body.star.story);
                    }
                    res.status(200).json( result );
                } else {
                    throw new Error;
                }
            }).catch(err => {
                res.status(403).send(`No star block with wallet address ${req.params.address} found`)
            })
        })
    }

    getStarBlockByHeight() {
        let self = this;
        this.app.get('/block/:height', async (req, res) => {
            let blockHeight = await self.blockChain.getBlockHeight();
            if (blockHeight == 1) {
                res.status(403).send('Only Genesis Block exists in blockchain. Cannot retrieve star data.')
            } else if (!(req.params.height > 0)) {
                res.status(403).send('Cannot retrieve star data from Genesis Block.');
            } else {
                self.blockChain.getBlock(req.params.height)
                .then((result) => {
                    result.body.star.storyDecoded = hex2ascii(result.body.star.story);
                    res.status(200).json( result );
                }).catch(err => {
                    res.status(403).send(`Error occurred when trying to obtain star block #${req.params.height}`);
                })
            }
        })
    }

    /*
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
     async initializeMockData() {
         let blockHeight = await this.blockChain.getBlockHeight();
         if(blockHeight === 0){
             for (let index = 1; index < 10; index++) {
                 let blockAux = new BlockClass.Block(`Test Data #${index}`);
                 blockAux.height = index;
                 blockAux.hash = SHA256(JSON.stringify(blockAux)).toString();
                 await this.blockChain.addBlock(blockAux);
                }
            }
        }
    */

}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}