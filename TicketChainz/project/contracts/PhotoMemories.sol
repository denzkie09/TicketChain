// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ITicketChain {
    function isAttendee(uint256 eventId, address user) external view returns (bool);
    function getEvent(uint256 eventId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        string memory venue,
        uint256 date,
        uint256 price,
        uint256 totalSupply,
        uint256 availableTickets,
        address organizer,
        string memory category,
        bool isSoulbound,
        bool hasPhotoMemories,
        string memory imageUrl,
        bool isActive
    );
}

contract PhotoMemories is ERC721URIStorage, ReentrancyGuard, Pausable, Ownable {
    enum Rarity { Common, Rare, Legendary }

    struct Memory {
        uint256 id;
        uint256 eventId;
        string title;
        string description;
        string imageUrl;
        Rarity rarity;
        address recipient;
        uint256 mintedAt;
    }

    ITicketChain public ticketChain;
    uint256 private _memoryCounter;

    mapping(uint256 => Memory) public memories;
    mapping(address => uint256[]) private _ownerMemories;
    mapping(uint256 => uint256[]) private _eventMemories;
    mapping(uint256 => mapping(address => bool)) public hasReceivedMemory;

    event MemoryMinted(
        uint256 indexed memoryId,
        uint256 indexed eventId,
        address indexed recipient,
        Rarity rarity,
        string title
    );

    constructor(address _ticketChainAddress) ERC721("PhotoMemories", "PM") Ownable(msg.sender) {
        ticketChain = ITicketChain(_ticketChainAddress);
    }

    function distributeMemories(
        uint256 eventId,
        address[] memory attendees,
        string[] memory titles,
        string[] memory descriptions,
        string[] memory imageUrls
    ) external onlyOwner whenNotPaused {
        require(attendees.length == titles.length, "Arrays length mismatch");
        require(titles.length == descriptions.length, "Arrays length mismatch");
        require(descriptions.length == imageUrls.length, "Arrays length mismatch");

        for (uint256 i = 0; i < attendees.length; i++) {
            require(ticketChain.isAttendee(eventId, attendees[i]), "Not an attendee");
            require(!hasReceivedMemory[eventId][attendees[i]], "Already received memory");

            _memoryCounter++;
            uint256 memoryId = _memoryCounter;

            Rarity rarity = _generateRarity();

            memories[memoryId] = Memory({
                id: memoryId,
                eventId: eventId,
                title: titles[i],
                description: descriptions[i],
                imageUrl: imageUrls[i],
                rarity: rarity,
                recipient: attendees[i],
                mintedAt: block.timestamp
            });

            _ownerMemories[attendees[i]].push(memoryId);
            _eventMemories[eventId].push(memoryId);
            hasReceivedMemory[eventId][attendees[i]] = true;

            _safeMint(attendees[i], memoryId);
            _setTokenURI(memoryId, imageUrls[i]);

            emit MemoryMinted(memoryId, eventId, attendees[i], rarity, titles[i]);
        }
    }

    function _generateRarity() private view returns (Rarity) {
        uint256 randomValue = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender,
            _memoryCounter
        ))) % 100;

        if (randomValue < 5) {
            return Rarity.Legendary; // 5%
        } else if (randomValue < 30) {
            return Rarity.Rare; // 25%
        } else {
            return Rarity.Common; // 70%
        }
    }

    function getMemory(uint256 memoryId) external view returns (Memory memory) {
        return memories[memoryId];
    }

    function getMemoriesByOwner(address owner) external view returns (uint256[] memory) {
        return _ownerMemories[owner];
    }

    function getMemoriesByEvent(uint256 eventId) external view returns (uint256[] memory) {
        return _eventMemories[eventId];
    }

    function getRarityString(Rarity rarity) external pure returns (string memory) {
        if (rarity == Rarity.Common) return "common";
        if (rarity == Rarity.Rare) return "rare";
        return "legendary";
    }

    function getMemoryCount() external view returns (uint256) {
        return _memoryCounter;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}