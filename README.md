# Secure Digital Asset on a Private Blockchain

In this project, I built a Star Registry Service that allows users to claim ownership of their favorite star in the night sky. This project uses RESTful WEB API with Express.js framework for Notary Service.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
To set up the project for review read the 'restful-private-blockchain' in my repo 

[RESTful WEB API with Express.js framework for private Blockchain service](https://github.com/minqukanq/restful-private-blockchain)

### Installing

This project has the following dependencies:
```
"dependencies": {
"bitcoinjs-message": "^2.0.0",
"body-parser": "^1.19.0",
"crypto-js": "^3.1.9-1",
"express": "^4.16.4",
"hashmap": "^2.3.0",
"hex2ascii": "0.0.3",
"level": "^5.0.1",
"secp256k1": "^3.7.0"
}
```



## Architecture
**DIAGRAM OF SEQUENCE**

![project-workflow-sequence-diagram](https://github.com/minqukanq/secure-digital-asset-on-a-private-blockchain/blob/master/img/project-workflow-sequence-diagram.png)

## Endpoints

### POST Endpoints
**/requestValidation/** - User sends the address of own bitcoin wallet. The address is added in mempool until the user proves that he owns the wallet (using **/message-signature/validate**)

```
curl -X POST \
  http://localhost:8000/requestValidation \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL"
}'
```

![RequestObject](https://github.com/minqukanq/secure-digital-asset-on-a-private-blockchain/blob/master/img/RequestObject.png)



**/message-signature/validate/** - Check if the user owns the bitcoin wallet. The user must submit a signed message by his bitcoin wallet.

```
curl -X POST \
  http://localhost:8000/message-signature/validate \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
"address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
"signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
}'
```

![ValidRequest](https://github.com/minqukanq/secure-digital-asset-on-a-private-blockchain/blob/master/img/ValidRequest.png)



**/block/** - After the user ensures that he owns the wallet, he can request the registration of a star in the block.

```
curl -X POST \
  http://localhost:8000/block \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
  "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "star": {
                "dec": "DEC",
                "ra": "RA",
                "mag": "MAG",
                "cen": "CEN",
                "story": "Found star using https://www.google.com/sky/"
            }
}'
```

![Block](https://github.com/minqukanq/secure-digital-asset-on-a-private-blockchain/blob/master/img/Block.png)



### GET Endpoints

**stars/hash:[HASH]** - Get Star block by hash

```
curl "http://localhost:8000/stars/hash:e5f7f50e75cf05daf1caddf25c8196bc25f684d61db355de34d7dc0f2e0be97c"
```

**stars/address:[ADDRESS]** - Get Star block by wallet address

```
curl "http://localhost:8000/stars/address:19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL"
```

**/block/[HEIGHT]** - Get star block by star block height with JSON response.

```
curl "http://localhost:8000/block/2"
```



## Built With

* [Node.js](https://nodejs.org/en/) - The JavaScript runtime used
* [Express.js](http://expressjs.com/) - The web API framework used
* [LevelDB](https://github.com/google/leveldb) - Used to persist blockchain data on disk
* [hex2ascii](https://www.npmjs.com/package/hex2ascii) - Used to Encoding and Decoding data
* [bitcoinjs](https://github.com/bitcoinjs) - Used to verify of message




## Authors

* **Mingu Kang** - [Github](https://github.com/minqukanq)
