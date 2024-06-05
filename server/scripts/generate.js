const secp = require("ethereum-cryptography/secp256k1");
const keccak256  = require('ethereum-cryptography/keccak');
const {toHex,utf8ToBytes} = require("ethereum-cryptography/utils");

const privateKey = secp.secp256k1.utils.randomPrivateKey();

console.log('private Key:', toHex (privateKey));

const publicKey = secp.secp256k1.getPublicKey(privateKey);
console.log('public Key:',toHex(publicKey));
//要签名的消息
const message = "Send 10 coins to address B";
const messagebytes = utf8ToBytes(message);
const messageHash = keccak256.keccak256(messagebytes);
// 签名消息  用私钥和消息  进行签名操作 保存签名
const signature = secp.secp256k1.sign(messageHash, privateKey);

// 验证签名   用签名和公钥、messageHash去进行验证
const isValidSignature = secp.secp256k1.verify(signature, messageHash, publicKey);
console.log('messageHash:',toHex(messageHash));
console.log('Is Valid Signature:', isValidSignature);
