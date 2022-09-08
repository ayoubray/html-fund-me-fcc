// in nodejs we use require()
// in front-end javascript we use import
import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

console.log(ethers);

async function withdraw() {
  console.log(`Withdrawing...`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    //await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask";
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const balance = await provider.getBalance(contractAddress);
      console.log(ethers.utils.formatEther(balance));
    } catch (error) {
      console.log(error);
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask";
  }
}

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    console.log("I seee a metamask!");
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (e) {
      console.log("THIS ERROR IS IN CONNECT FUNCTION -> " + e);
    }
    console.log("Connected Succesfully !");
    connectButton.innerHTML = "Connected !";
  } else {
    connectButton.innerHTML = "Please install MetaMask !";
    console.log("No metamask!");
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log("Funding with " + ethAmount + " ...");
  if (typeof window.ethereum !== "undefined") {
    // provider / connection to the blockchain
    // signer / wallet / someone with some gas
    // contract that we are interacting with
    // ^ ABI & Address
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      // listen for the tx to be mined
      // listen for an event <- we have not learned about that
      // wait for this TX to finish
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done !!!");
    } catch (e) {
      console.log("THIS ERROR IN FUND FUNCTION -> " + e);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log("Mining " + transactionResponse.hash);

  // create listener for the blockchain
  // listen for this transaction to finish
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        "Completed with " + transactionReceipt.confirmations + " confirmations"
      );
      resolve();
    });
  });
}
