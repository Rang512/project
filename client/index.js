const axios = require('axios');
const niceList = require('../utils/niceList.json');
const MerkleTree = require('../utils/MerkleTree');

const serverUrl = 'http://localhost:1225';

async function main() {
  // TODO: how do we prove to the server we're on the nice list? 
  const name = 'Shelly Toy';
  
  const merkleTree = new MerkleTree(niceList);

  const index = niceList.indexOf(name);
  if(index === -1) {
    console.error('Name not found in the list');
    return;
  }

  const proof = merkleTree.getProof(index);

  const { data: gift } = await axios.post(`${serverUrl}/gift`, {
    // TODO: add request body parameters here!
    name,
    proof
  });

  console.log({ gift });
}

main();