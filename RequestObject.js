class RequestObject {
	constructor(walletAddress, requestTimeStamp){
		this.walletAddress = walletAddress,
        this.requestTimeStamp = requestTimeStamp,
		this.message = walletAddress + ":" + requestTimeStamp + ":starRegistry",
		this.validationWindow = ""
	}
}

module.exports.RequestObject = RequestObject;