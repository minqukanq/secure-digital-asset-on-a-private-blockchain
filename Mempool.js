/* ===== Mempool Class ==========================
|  Class with a constructor for new mempool		|
|  ================================================*/
const bitcoinMessage = require('bitcoinjs-message');

class Mempool {
    constructor() {
        this.memPool = [];
        this.memPoolValid = [];
    }

    // Add request validation to memPool
    addRequestValidation(req){
        let self = this;
        let memPoolIndex;
        
        let requestObject = {
            walletAddress: req.body.address,
            // requestTimeStamp: new Date().getTime().toString().slice(0,-3),
            requestTimeStamp: 1541605128,
            // message: req.body.address + ':' + new Date().getTime().toString().slice(0,-3) + ':' + 'starRegistry',
            message: req.body.address + ':' + 1541605128 + ':' + 'starRegistry',
            validationWindow: 0
        };

        if (self.memPool.length > 0) {
            for (let i = 0; i < self.memPool.length; i++) {
                if (self.memPool[i].walletAddress === req.body.address) {
                    memPoolIndex = i;
                }
            }
        }
        
        if (memPoolIndex >= 0)
        {
            requestObject = self.memPool[memPoolIndex]
            let timeElapse = new Date().getTime().toString().slice(0,-3) - requestObject.requestTimeStamp;
            let timeLeft = (self.TimeoutRequestsWindowTime/1000) - timeElapse;
            // requestObject.validationWindow = timeLeft;
            requestObject.validationWindow = 300;

            return new Promise ((resolve, reject)=> {
                resolve(requestObject);
            })
        }
        else
        {
            return new Promise ((resolve, reject)=> {
                self.setTimeOut(requestObject)
                .then(result => {
                    self.memPool.push(result);
                    console.log('\nMemPool contents:\n', self.memPool) // VERBOSE
                    resolve(result);
                });
            })
        }     
    }

    // Set timeout for the memPool
    setTimeOut(request){
        let self = this;
        self.TimeoutRequestsWindowTime = 5 * 60 * 1000;
        let timeElapse = new Date().getTime().toString().slice(0,-3) - request.requestTimeStamp;
        let timeLeft = (self.TimeoutRequestsWindowTime/1000) - timeElapse;
        // request.validationWindow = timeLeft;
        request.validationWindow = 300;

        return new Promise ((resolve)=> {
            setTimeout(function(){ 
                self.memPool.splice(self.memPool.indexOf(request), 1)},
                self.TimeoutRequestsWindowTime);

            resolve(request);
        })
    }

    // Set validation by wallet
    async validateWalletSignature(request) {
        let self = this;
        let isIncludedinMemPool;
        let requestObject;
        let validRequest;

        for (let i = 0; i < self.memPool.length; i++) {
            if (self.memPool[i].walletAddress === request.body.address) {
                isIncludedinMemPool = i;
            }
        }
        if (isIncludedinMemPool >= 0) {
            requestObject = self.memPool[isIncludedinMemPool];
            requestObject.messageSignature = request.body.signature;
            validRequest = {
                registerStar: false,
                status: requestObject
            }
            console.log(validRequest); // VERBOSE
            
            let timeElapse = new Date().getTime().toString().slice(0,-3) - requestObject.requestTimeStamp;
            let timeLeft = (self.TimeoutRequestsWindowTime/1000) - timeElapse;
            requestObject.validationWindow = timeLeft;
            let isValidSignature = await bitcoinMessage.verify(validRequest.status.message, validRequest.status.walletAddress, validRequest.status.messageSignature);
            
            console.log(isValidSignature)
            if (isValidSignature) {
                validRequest.status.messageSignature = true;
                validRequest.registerStar = true;
                self.memPoolValid.push( validRequest.status.walletAddress.toString() );
                self.memPool.splice(self.memPool.indexOf(requestObject), 1);
                console.log('\nMemPoolValid contents:\n', self.memPoolValid);
            }
        } else {
            throw new Error;
        }
        return validRequest;
    }

    validateAddressRequest(requestAddress) {
        let self = this;
        // not work
        // let isValid = this.memPoolValid.includes(requestAddress.toString());
        for (var i = 0; i < self.memPoolValid.length; i++){            
            if (self.memPoolValid[i] == requestAddress) {
                self.memPoolValid.splice(i, 1);
                return true;
            } 
        }
        return false;
    }

}

module.exports.Mempool = Mempool;