// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PokerGame {
    address public owner;
    uint256 public constant PLATFORM_FEE_RATE = 5; // 0.5% = 5/1000
    uint256 public constant FEE_DENOMINATOR = 1000;
    uint256 public constant MAX_PLAYERS = 6;

    struct Room {
        uint256 roomId;
        address creator;
        uint256 buyInAmount;
        uint256 potAmount;
        uint8 playerCount;
        address[] players;
        mapping(address => uint256) playerChips;
        mapping(address => bool) isPlayerActive;
        bool isActive;
        uint256 createdAt;
    }

    struct GameResult {
        uint256 roomId;
        address winner;
        uint256 potAmount;
        uint256 feeAmount;
        uint256 timestamp;
    }

    uint256 public roomCounter;
    mapping(uint256 => Room) public rooms;
    mapping(address => uint256[]) public playerRooms;
    GameResult[] public gameHistory;

    event RoomCreated(uint256 indexed roomId, address indexed creator, uint256 buyInAmount);
    event PlayerJoined(uint256 indexed roomId, address indexed player, uint256 amount);
    event PlayerLeft(uint256 indexed roomId, address indexed player);
    event GameStarted(uint256 indexed roomId, uint8 playerCount);
    event GameEnded(uint256 indexed roomId, address indexed winner, uint256 potAmount, uint256 feeAmount);
    event ChipsTransferred(uint256 indexed roomId, address indexed from, address indexed to, uint256 amount);
    event FeesCollected(uint256 amount, address indexed collector);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier roomExists(uint256 _roomId) {
        require(_roomId < roomCounter, "Room does not exist");
        _;
    }

    modifier roomActive(uint256 _roomId) {
        require(rooms[_roomId].isActive, "Room is not active");
        _;
    }

    constructor() {
        owner = msg.sender;
        roomCounter = 0;
    }

    function createRoom(uint256 _buyInAmount) external payable returns (uint256) {
        require(_buyInAmount > 0, "Buy-in amount must be greater than 0");
        require(msg.value == _buyInAmount, "Must send exact buy-in amount");

        uint256 roomId = roomCounter;
        Room storage newRoom = rooms[roomId];
        newRoom.roomId = roomId;
        newRoom.creator = msg.sender;
        newRoom.buyInAmount = _buyInAmount;
        newRoom.potAmount = 0;
        newRoom.playerCount = 1;
        newRoom.isActive = true;
        newRoom.createdAt = block.timestamp;

        newRoom.players.push(msg.sender);
        newRoom.playerChips[msg.sender] = _buyInAmount;
        newRoom.isPlayerActive[msg.sender] = true;

        playerRooms[msg.sender].push(roomId);
        roomCounter++;

        emit RoomCreated(roomId, msg.sender, _buyInAmount);
        emit PlayerJoined(roomId, msg.sender, _buyInAmount);

        return roomId;
    }

    function joinRoom(uint256 _roomId) external payable roomExists(_roomId) roomActive(_roomId) {
        Room storage room = rooms[_roomId];
        require(room.playerCount < MAX_PLAYERS, "Room is full");
        require(!room.isPlayerActive[msg.sender], "Already in this room");
        require(msg.value == room.buyInAmount, "Must send exact buy-in amount");

        room.players.push(msg.sender);
        room.playerChips[msg.sender] = msg.value;
        room.isPlayerActive[msg.sender] = true;
        room.playerCount++;

        playerRooms[msg.sender].push(_roomId);

        emit PlayerJoined(_roomId, msg.sender, msg.value);

        if (room.playerCount >= 2) {
            emit GameStarted(_roomId, room.playerCount);
        }
    }

    function leaveRoom(uint256 _roomId) external roomExists(_roomId) {
        Room storage room = rooms[_roomId];
        require(room.isPlayerActive[msg.sender], "Not in this room");

        uint256 refundAmount = room.playerChips[msg.sender];
        require(refundAmount > 0, "No chips to refund");

        room.isPlayerActive[msg.sender] = false;
        room.playerChips[msg.sender] = 0;
        room.playerCount--;

        if (room.playerCount == 0) {
            room.isActive = false;
        }

        payable(msg.sender).transfer(refundAmount);

        emit PlayerLeft(_roomId, msg.sender);
    }

    function transferChipsToPot(uint256 _roomId, uint256 _amount) external roomExists(_roomId) roomActive(_roomId) {
        Room storage room = rooms[_roomId];
        require(room.isPlayerActive[msg.sender], "Not an active player");
        require(room.playerChips[msg.sender] >= _amount, "Insufficient chips");

        room.playerChips[msg.sender] -= _amount;
        room.potAmount += _amount;

        emit ChipsTransferred(_roomId, msg.sender, address(this), _amount);
    }

    function endGame(uint256 _roomId, address _winner) external roomExists(_roomId) roomActive(_roomId) {
        Room storage room = rooms[_roomId];
        require(msg.sender == room.creator || msg.sender == owner, "Only creator or owner can end game");
        require(room.isPlayerActive[_winner], "Winner must be active player");
        require(room.potAmount > 0, "No pot to distribute");

        uint256 totalPot = room.potAmount;
        uint256 feeAmount = (totalPot * PLATFORM_FEE_RATE) / FEE_DENOMINATOR;
        uint256 winnerAmount = totalPot - feeAmount;

        room.potAmount = 0;
        room.isActive = false;

        for (uint256 i = 0; i < room.players.length; i++) {
            address player = room.players[i];
            room.isPlayerActive[player] = false;
            room.playerChips[player] = 0;
        }

        payable(_winner).transfer(winnerAmount);
        payable(owner).transfer(feeAmount);

        gameHistory.push(GameResult({
            roomId: _roomId,
            winner: _winner,
            potAmount: totalPot,
            feeAmount: feeAmount,
            timestamp: block.timestamp
        }));

        emit GameEnded(_roomId, _winner, totalPot, feeAmount);
        emit FeesCollected(feeAmount, owner);
    }

    function getRoom(uint256 _roomId) external view roomExists(_roomId) returns (
        uint256 roomId,
        address creator,
        uint256 buyInAmount,
        uint256 potAmount,
        uint8 playerCount,
        address[] memory players,
        bool isActive,
        uint256 createdAt
    ) {
        Room storage room = rooms[_roomId];
        return (
            room.roomId,
            room.creator,
            room.buyInAmount,
            room.potAmount,
            room.playerCount,
            room.players,
            room.isActive,
            room.createdAt
        );
    }

    function getPlayerChips(uint256 _roomId, address _player) external view roomExists(_roomId) returns (uint256) {
        return rooms[_roomId].playerChips[_player];
    }

    function isPlayerInRoom(uint256 _roomId, address _player) external view roomExists(_roomId) returns (bool) {
        return rooms[_roomId].isPlayerActive[_player];
    }

    function getPlayerRooms(address _player) external view returns (uint256[] memory) {
        return playerRooms[_player];
    }

    function getGameHistory() external view returns (GameResult[] memory) {
        return gameHistory;
    }

    function getGameHistoryByRoom(uint256 _roomId) external view returns (GameResult[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < gameHistory.length; i++) {
            if (gameHistory[i].roomId == _roomId) {
                count++;
            }
        }

        GameResult[] memory result = new GameResult[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < gameHistory.length; i++) {
            if (gameHistory[i].roomId == _roomId) {
                result[index] = gameHistory[i];
                index++;
            }
        }

        return result;
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner).transfer(balance);
    }

    function changeOwner(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }

    receive() external payable {}
}
