// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Lottery {
    address public manager;
    address[] public players;
    address[] public winners;
    uint[] public rewards;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > .01 ether, "Minimum eth .01");
        players.push(msg.sender);
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, players)));
    }

    function pickWinner() public restricted {
        uint index = random() % players.length;
        address winner = players[index];
        uint reward = address(this).balance;

        // Kifizetjük a nyertesnek a nyereményt
        payable(winner).transfer(reward);
        
        // Eltároljuk a nyertest és a nyeremény összegét
        winners.push(winner);
        rewards.push(reward);

        // Nyertesek tömböt reseteljük
      players = new address payable[](0) ;
    }

    modifier restricted() {
        require(msg.sender == manager, "Csak a manager tudja meghivni a fuggvenyt");
        _;
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    function getWinners() public view returns (address[] memory) {
        return winners;
    }

    function getRewards() public view returns (uint[] memory) {
        return rewards;
    }
}
