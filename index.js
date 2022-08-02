'use strict';

const SHA256 = require('crypto-js/sha256')
const crypto = require('crypto');

/**
 * Module exports.
 * @public
 */
module.exports = rng;

/**
 * function to generate hash from salt.
 */
function saltHash(hash) {
    return SHA256(hash).toString();
};

/**
 * function to generate hash from seed.
 */
function generateHash(seed) {
    return crypto.createHash('sha256').update(seed).digest('hex');
};

/**
 * function to generate server seed.
 */
const createServerSeed = () => {
    const serverSeed = crypto.randomBytes(256).toString('hex');
    return generateHash(serverSeed);
};

/**
 * function to generate hash
 */
const hashGenerator = (clientSeed, serverSeed) => {
    const clientSeedHash = generateHash(clientSeed);
    const serverSeedHash = generateHash(serverSeed);

    const hash = saltHash((clientSeedHash + serverSeedHash + 1));
    return hash;
};

/**
 * Function to verify string provided is valid SHA256 hash or not.
 * @param {*} str 
 * @returns 
 */
function checkIfValidSHA256(seed) {
	// Regular expression to check if string is a SHA256 seed
	const regexExp = /^[a-f0-9]{64}$/gi;
	return regexExp.test(seed);
}

/**
 * function to generate random numbers.
 * @param {*} hash 
 * @param {*} lowestNumber 
 * @param {*} highestNumber 
 * @param {*} randomNumbersQuantity 
 * @returns 
 */
function rng (clientSeed, lowestNumber, highestNumber, randomNumbersQuantity) {
	if (randomNumbersQuantity < 0){
        throw new Error('Please pass positive value to generate random numbers.');
    }

    if (!checkIfValidSHA256(clientSeed)){
		throw new Error('Please provide valid SHA256 clientSeed.');
	}

    let randomNumbers = [], cryptoNumber, index = 0, rand, serverSeedHash = createServerSeed();
	let hash = hashGenerator(clientSeed, serverSeedHash), serverSeeds = [ serverSeedHash ];

    for (let i = 0; i < randomNumbersQuantity; i++){

        if (index >= 52){
			serverSeedHash = createServerSeed();
			serverSeeds.push(serverSeedHash);
			hash = hashGenerator(clientSeed, serverSeedHash);
            index = 0;
        }
  
        cryptoNumber = parseInt(hash.substr(index, 13), 16);
        rand = (cryptoNumber % ( highestNumber - lowestNumber )) + lowestNumber + 1; // plus 1 to include highest number in the range

        randomNumbers.push(rand);
        index = index + 13;
    }

    return { randomNumbers, serverSeeds }; 
};