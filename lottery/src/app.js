const contractAddress = "0x89FDe98E60aa4aECA670702c2ec47E6FC51f05c3"; 
const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "manager",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "players",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "rewards",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "winners",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "enter",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pickWinner",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getPlayers",
        "outputs": [
          {
            "internalType": "address[]",
            "name": "",
            "type": "address[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getWinners",
        "outputs": [
          {
            "internalType": "address[]",
            "name": "",
            "type": "address[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getRewards",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
];

let web3;
let lottery;

window.addEventListener('load', async () => {
    web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

    if (web3) {
        lottery = new web3.eth.Contract(contractABI, contractAddress);
        console.log('Contract initialized:', lottery);

        const accounts = await web3.eth.getAccounts();
        const accountsDropdown = document.getElementById("accounts");

        accounts.forEach(account => {
            const option = document.createElement("option");
            option.value = account;
            option.text = account;

            accountsDropdown.add(option);
        });

        // Load winners and rewards
        await loadWinnersAndRewards();

    } else {
        console.error('web3 betöltés hiba');
        alert('web3 betöltés hiba. Gnache settings beállítás');
    }
});

async function enterLottery() {
    const message = document.getElementById("message");
    const accountsDropdown = document.getElementById("accounts");
    const selectedAccount = accountsDropdown.value;
    const etherAmount = document.getElementById("etherAmount").value;

    if (!etherAmount) {
        message.innerText = "Írja be a kívánt ETH összeget.";
        return;
    }

    message.innerText = "Részvétel a lottóba...";

    try {
        await lottery.methods.enter().send({
            from: selectedAccount,
            value: web3.utils.toWei(etherAmount, "ether")
        });

        message.innerText = "Részt vesz a lottó játéba!";
    } catch (error) {
        console.error('Hiba történt részvétel közbe:', error);
        message.innerText = `Error: ${error.message}`;
    }
}

async function pickWinner() {
    const message = document.getElementById("message");
    const accountsDropdown = document.getElementById("accounts");
    const selectedAccount = accountsDropdown.value;

    const manager = await lottery.methods.manager().call();
    if (selectedAccount.toLowerCase() !== manager.toLowerCase()) {
        message.innerText = "Only the manager can pick a winner.";
        return;
    }

    try {
        await lottery.methods.pickWinner().send({
            from: selectedAccount,
            gas: 3000000 // Gas limit beállítása. Itt tudjuk állítani a limitet.
        });

        message.innerText = "A winner has been picked!";
        await loadWinnersAndRewards(); //Frissítjük a nyertesek és nyereményeket.

    } catch (error) {
        console.error('Hiba a nyertes sorsolása közben:', error);
        message.innerText = `Error: ${error.message}`;
    }
}

async function loadWinnersAndRewards() {
    const winnersElement = document.getElementById("winners");
    winnersElement.innerHTML = "";

    try {
        const winners = await lottery.methods.getWinners().call();
        const rewards = await lottery.methods.getRewards().call();

        winners.forEach((winner, index) => {
            const reward = web3.utils.fromWei(rewards[index], 'ether');
            const listItem = document.createElement("li");
            listItem.innerText = `Winner: ${winner}, Reward: ${reward} ETH`;
            winnersElement.appendChild(listItem);
        });

    } catch (error) {
        console.error('Hiba a nyertes és nyeremény betöltése közben:', error);
    }
}
