    /* ===== Mempool Class =============================
    |  Class with a constructor for new mempool 		|
    |  ================================================*/

    const RequestObject = require('./RequestObject.js');
    const ValidRequest = require('./ValidRequest.js');
    const LevelSandbox = require('./LevelSandbox.js');
    const Block = require('./Block.js');
    const bitcoinMessage = require('bitcoinjs-message'); 
    
    const TimeoutRequestsWindowTime = 5 * 60 * 1000;
 
    class Mempool {
        constructor() {
            this.mempool = [];
            this.timeoutRequests = [];
            this.mempoolValid = [];
            this.db = new LevelSandbox.LevelSandbox();
        }

        checkAddress(address) {
            for (var i = 0; i < this.mempool.length; i++){
                if (JSON.parse(this.mempool[i]).walletAddress == address) {
                    return true;
                }
            }
            return false;
        }

        getRequestObject(address) {
            for (var i = 0; i < this.mempool.length; i++){
                if (JSON.parse(this.mempool[i]).walletAddress == address) {
                    let request  = new RequestObject.RequestObject(address, JSON.parse(this.mempool[i]).requestTimeStamp);
                    request.validationWindow = this.verifyTimeLeft(request.requestTimeStamp);
                    return request;
                }
            }
        }
        
        addRequestValidation(address){
            // let requestTimeStamp = new Date().getTime().toString().slice(0,-3);
            let requestTimeStamp = 1541605128;
            let requestObject = new RequestObject.RequestObject(address, requestTimeStamp);
            requestObject.validationWindow = this.verifyTimeLeft(requestTimeStamp);
            requestObject.validationWindow = 300

            //insert the new request in the mempool
            this.mempool.push(JSON.stringify(requestObject).toString());
            //set the timeout of the request
            this.setTimeOut(address);
            console.log(requestObject);
            return requestObject;
        }

        verifyTimeLeft(requestTimeStamp){
            let timeElapse = (new Date().getTime().toString().slice(0,-3)) - requestTimeStamp;
            timeElapse = 288;
            return (TimeoutRequestsWindowTime/1000) - timeElapse;
        }

        verifyBitcoinMessage(address, signature){
            let requestObject = this.getRequestObject(address);
            let message = requestObject.message;
            if(bitcoinMessage.verify(message, address, signature)){
                //insert a new item to mempoolValid
                this.addValidRequest(address);
                return true;
            } else {
                return false;
            }
        }

        removeTimeOut(address){
            //remove item from timeoutRequests
            this.timeoutRequests.splice(this.timeoutRequests.indexOf(address),1);
            //remove item from mempool
            this.removeRequestObject(address);
        }

        setIsNotValid(address){
            for (var i = 0; i < this.mempoolValid.length; i++){
                if (JSON.parse(this.mempoolValid[i]).status.address == address) {
                    this.mempoolValid.splice(i, 1);
                } 
            }
        }

        getValidRequest(address){
            for (var i = 0; i < this.mempoolValid.length; i++){
                if (JSON.parse(this.mempoolValid[i]).status.address == address) {
                    return this.mempoolValid[i];
                }
            }    
        }

        addValidRequest(address){
            let requestObject = this.getRequestObject(address);
            let validRequest = new ValidRequest.ValidRequest(address,requestObject.requestTimeStamp);
            validRequest.registerStar = true;
            //update the validationWindow before record in mempool
            validRequest.status.validationWindow = this.verifyTimeLeft(requestObject.requestTimeStamp); 
            validRequest.status.messageSignature = true;
            this.mempoolValid.push(JSON.stringify(validRequest).toString());
        }

        isValid(address){
            for (var i = 0; i < this.mempoolValid.length; i++){
                if (JSON.parse(this.mempoolValid[i]).status.address == address) {
                    return true;
                } 
            }
            return false;
        }

        addBlock(body){
            return this.db.addBlock(new Block.Block(body));
        }

        // Get Block By Hash
         getBlockByHash(hash) {
            return this.db.getBlockByHash(hash);        
        }

        // Get Block By Address
         getBlockByAddress(address) {
            return this.db.getBlockByAddress(address);        
        }

        // Get Block By Address
         getBlock(height) {
            return this.db.getBlock(height);        
        }

        setTimeOut(address){
            let self = this;
            this.timeoutRequests[address] = setTimeout(function(){ self.removeRequestObject(address) }, TimeoutRequestsWindowTime);
        }

        removeRequestObject(address) {
            for (var i = 0; i < this.mempool.length; i++){
                if (JSON.parse(this.mempool[i]).walletAddress == address) {
                    this.mempool.splice(i, 1);
                    break;
                } 
            }
        }
    }

    module.exports.Mempool = Mempool;