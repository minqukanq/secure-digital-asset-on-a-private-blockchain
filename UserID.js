const bitcoinMessage = require('bitcoinjs-message');

const TimeoutRequestsWindowTime = 5*60*1000;

class UserID{

    constructor(address){
        this.address = address;
        this.timeStamp = (new Date().getTime().toString().slice(0,-3));
        // this.message = this.address + ":" + this.timeStamp + ":starRegistry";
        this.message = this.address + ":" + "1541605128" + ":starRegistry";
        this.validationWindow = this.getValidationTime();

        setTimeout(function(){
            this.validationWindow = 0;
            console.log(" validation winndow timeout");
        }, TimeoutRequestsWindowTime );
    }

    getValidationTime(){
        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - this.timeStamp;
        let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
        return timeLeft;
    }
}

module.exports.UserID = UserID;