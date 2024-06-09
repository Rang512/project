import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow';
import Escrow2 from './artifacts/contracts/Escrow.sol/Escrow';


const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();
  const [arbiter, setArbiter] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [balance, setBalance] = useState("");
  const [contractAddress,setContractAddress] = useState("")

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const valueInEth = document.getElementById('eth').value;
    const valueInWei = ethers.utils.parseEther(valueInEth); 
    const escrowContract = await deploy(signer, arbiter, beneficiary, valueInWei);

    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: valueInEth.toString(),
      handleApprove: async () => {
        escrowContract.on('Approved', () => {
          document.getElementById(escrowContract.address).className =
            'complete';
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, signer);
      },
    };

    setEscrows([...escrows, escrow]);
  }




async function handleConnectContract(){
  const contractAddress = document.getElementById('contractAddress').value;
  const contract = new ethers.Contract(
    contractAddress,
    Escrow2.abi,
    provider
  );
  const arbiterAddress = await contract.arbiter();
  const beneficiaryAddress = await contract.beneficiary();
  const balance = await provider.getBalance(contractAddress);
  setArbiter(arbiterAddress);
  setBeneficiary(beneficiaryAddress);
  setBalance(ethers.utils.formatEther(balance));
  setContractAddress(contractAddress);


  
  // console.log(ethers.utils.formatEther(balance));
  // console.log(arbiterAddress);
  // console.log(beneficiaryAddress);
}


  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>

        <label>
          Deposit Amount (in Eth)
          <input type="text" id="eth" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>

        <div id="container">
          {escrows.map((escrow) => {
            return <Escrow key={escrow.address} {...escrow} />;
          })}
        </div>
      </div>

      
      <div className="Findcontract">
        <h1> Find Contract </h1>
        <label>
          contract Address
          <input type="text" id="contractAddress" />
        </label>

        <div
          className="button"
          id="find"
          onClick={(e) => {
            e.preventDefault();

            handleConnectContract();
          }}
        >
          start
        </div>
      </div>

      {contractAddress && (
        <div className="contract-details">
          <h2>Contract Details</h2>
          <p><strong>Contract Address:</strong> {contractAddress}</p>
          <p><strong>Arbiter:</strong> {arbiter}</p>
          <p><strong>Beneficiary:</strong> {beneficiary}</p>
          <p><strong>Balance:</strong> {balance} ETH</p>
          
        </div>
      )}

      
    </>
  );
}

export default App;
