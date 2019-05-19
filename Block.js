/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
	constructor(data){
		this.hash = "";
		this.height = 0;
		this.body = data;
		this.time = new Date().getTime().toString().slice(0,-3);
		this.previousBlockHash = "";
	}
}

module.exports.Block = Block;