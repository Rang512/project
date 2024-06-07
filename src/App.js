import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';

import './App.css';

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);

function App() {
  const [nftMetadata, setNftMetadata] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [blockNumber, setBlockNumber] = useState();
  const [blockDetails, setBlockDetails] = useState(null);//详细信息
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [accountAddress, setAccountAddress] = useState('');
  const [accountBalance, setAccountBalance] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [address, setAddress] = useState('');
  const [transfers, setTransfers] = useState(null);
  useEffect(() => {
    async function fetchBlockNumber() {
      const blockNumber = await alchemy.core.getBlockNumber();
      setBlockNumber(blockNumber);
      fetchBlockDetails(blockNumber);
    }
    async function fetchBlockDetails(blockNumber){
      const block = await alchemy.core.getBlockWithTransactions(blockNumber);
      setBlockDetails(block);
    }
    fetchBlockNumber();
  },[]);

  async function getNftMetadata(contractAddress,tokenId){
    const metadata = await alchemy.nft.getNftMetadata(contractAddress, tokenId);
    setNftMetadata(metadata)
  }

  async function checkTransactionMined(transactionHash) {
    const receipt = await alchemy.core.getTransactionReceipt(transactionHash);
    setTransactionStatus(receipt ? 'Mined':'Pending');
  }
  
  async function getTransfersReceivedThisYear(address) {
    const transfers = await alchemy.core.getAssetTransfers({
      toAddress: address,
      category: ['external', 'internal', 'erc20', 'erc721', 'erc1155']
    });//获取交易信息

    
    setTransfers(transfers);
  }
  

  async function handleTransactionClick(transactionHash){
    const transactionReceipt = await alchemy.core.getTransactionReceipt(transactionHash);
    setSelectedTransaction(transactionReceipt);
  }
  async function handleAccountLookup(){
    const balance = await alchemy.core.getBalance(accountAddress);
    setAccountBalance(balance);
  }
  // return <div className="App">Block Number: {blockNumber}</div>;
  return (
    <div className="App">
      <h1>Ethereum Block Explorer</h1>
      <div>
        <h2>Current Block Number: {blockNumber}</h2>
        {blockDetails && (
          <div>
            <h3>Block Details:</h3>
            <p>Block Number: {blockDetails.number}</p>
            <p>Timestamp: {new Date(blockDetails.timestamp * 1000).toString()}</p>
            <p>Miner: {blockDetails.miner}</p>
            <p>Number of Transactions: {blockDetails.transactions.length}</p>
            <h4>Transactions:</h4>
            <ul>
              {blockDetails.transactions.map((tx) => (
                <li key={tx.hash} onClick={() => handleTransactionClick(tx.hash)}>
                  {tx.hash}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div>
          <h1>nftMetadata</h1>
          <input
            type='text'
            placeholder='Contract Address'
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          />
          <input
            type='text'
            placeholder='Token ID'
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
          />
          <button onClick={() => getNftMetadata(contractAddress, tokenId)}>Get NFT metadata</button>
          {nftMetadata &&(
            <div>
              <p>Name: {nftMetadata.title}</p>
              <p>Description:{nftMetadata.description}</p>
              <img src={nftMetadata.metadata.image} alt={nftMetadata.title}/>
            </div>
          )}
        </div>
        
        <div>
        <h2>Transaction Status</h2>
        <input
          type="text"
          placeholder="Transaction Hash"
          value={transactionHash}
          onChange={(e) => setTransactionHash(e.target.value)}
        />
        <button onClick={() => checkTransactionMined(transactionHash)}>Check Transaction Status</button>
        {transactionStatus && <p>Status: {transactionStatus}</p>}
      </div>

      <div>
        <h2>Transfers Received This Year</h2>
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button onClick={() => getTransfersReceivedThisYear(address)}>Get Transfers</button>
        {transfers && (
          <div>
            <h3>Transfers:</h3>
            <ul>
              {transfers.transfers.map((transfer) => (
                <li key={transfer.hash}>
                  From: {transfer.from} To: {transfer.to} Amount: {transfer.value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

        {selectedTransaction && (
          <div>
            <h3>Transaction Details:</h3>
            <p>Transaction Hash: {selectedTransaction.transactionHash}</p>
            <p>Block Number: {selectedTransaction.blockNumber}</p>
            <p>From: {selectedTransaction.from}</p>
            <p>To: {selectedTransaction.to}</p>
            <p>Gas Used: {selectedTransaction.gasUsed.toString()}</p>
          </div>
        )}
        <div>
          <h3>Account Balance Lookup:</h3>
          <input
            type="text"
            placeholder="Enter account address"
            value={accountAddress}
            onChange={(e) => setAccountAddress(e.target.value)}
          />
          <button onClick={handleAccountLookup}>Lookup</button>
          {accountBalance && (
            <div>
              <p>Balance: {accountBalance.toString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
