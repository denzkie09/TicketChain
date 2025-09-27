// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketChain is ERC721URIStorage, ReentrancyGuard, Pausable, Ownable {
    struct Event {
        uint256 id;
        string title;
        string description;
        string venue;
        uint256 date;
        uint256 price;
        uint256 totalSupply;
        uint256 availableTickets;
        address organizer;
        string category;
        bool isSoulbound;
        bool hasPhotoMemories;
        string imageUrl;
        bool isActive;
    }

    struct Ticket {
        uint256 id;
        uint256 eventId;
        address owner;
        bool isSoulbound;
        uint256 mintedAt;
        bool isUsed;
    }

    uint256 private _eventCounter;
    uint256 private _ticketCounter;

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => bool) public organizers;
    mapping(uint256 => uint256[]) private _eventTickets;
    mapping(address => uint256[]) private _ownerTickets;
    mapping(uint256 => mapping(address => bool)) public attendees;

    event EventCreated(
        uint256 indexed eventId,
        string title,
        address indexed organizer,
        uint256 price,
        uint256 totalSupply,
        bool isSoulbound,
        bool hasPhotoMemories
    );

    event TicketPurchased(
        uint256 indexed ticketId,
        uint256 indexed eventId,
        address indexed buyer,
        uint256 price,
        bool isSoulbound
    );

    event TicketUsed(uint256 indexed ticketId, address indexed owner);
    event OrganizerAdded(address indexed organizer);

    constructor() ERC721("TicketChain", "TCK") Ownable(msg.sender) {
        organizers[msg.sender] = true;
    }

    modifier onlyOrganizer() {
        require(organizers[msg.sender], "Not an organizer");
        _;
    }

    function createEvent(
        string memory title,
        string memory description,
        string memory venue,
        uint256 date,
        uint256 price,
        uint256 totalSupply,
        string memory category,
        bool isSoulbound,
        bool hasPhotoMemories,
        string memory imageUrl
    ) external onlyOrganizer whenNotPaused returns (uint256) {
        require(date > block.timestamp, "Event date must be in the future");
        require(totalSupply > 0, "Total supply must be greater than 0");
        require(bytes(title).length > 0, "Title cannot be empty");

        _eventCounter++;
        uint256 eventId = _eventCounter;

        events[eventId] = Event({
            id: eventId,
            title: title,
            description: description,
            venue: venue,
            date: date,
            price: price,
            totalSupply: totalSupply,
            availableTickets: totalSupply,
            organizer: msg.sender,
            category: category,
            isSoulbound: isSoulbound,
            hasPhotoMemories: hasPhotoMemories,
            imageUrl: imageUrl,
            isActive: true
        });

        emit EventCreated(eventId, title, msg.sender, price, totalSupply, isSoulbound, hasPhotoMemories);
        return eventId;
    }

    function purchaseTicket(uint256 eventId) external payable whenNotPaused nonReentrant returns (uint256) {
        Event storage eventData = events[eventId];
        require(eventData.isActive, "Event is not active");
        require(eventData.availableTickets > 0, "No tickets available");
        require(msg.value == eventData.price, "Incorrect payment amount");
        require(eventData.date > block.timestamp, "Event has already passed");

        _ticketCounter++;
        uint256 ticketId = _ticketCounter;

        tickets[ticketId] = Ticket({
            id: ticketId,
            eventId: eventId,
            owner: msg.sender,
            isSoulbound: eventData.isSoulbound,
            mintedAt: block.timestamp,
            isUsed: false
        });

        eventData.availableTickets--;
        _eventTickets[eventId].push(ticketId);
        _ownerTickets[msg.sender].push(ticketId);
        attendees[eventId][msg.sender] = true;

        _safeMint(msg.sender, ticketId);

        // Transfer payment to organizer
        payable(eventData.organizer).transfer(msg.value);

        emit TicketPurchased(ticketId, eventId, msg.sender, msg.value, eventData.isSoulbound);
        return ticketId;
    }

    function useTicket(uint256 ticketId) external whenNotPaused {
        require(_ownerOf(ticketId) == msg.sender, "Not the ticket owner");
        Ticket storage ticket = tickets[ticketId];
        require(!ticket.isUsed, "Ticket already used");

        Event storage eventData = events[ticket.eventId];
        require(block.timestamp >= eventData.date, "Event has not started yet");

        ticket.isUsed = true;
        emit TicketUsed(ticketId, msg.sender);
    }

    function addOrganizer(address organizer) external onlyOwner {
        organizers[organizer] = true;
        emit OrganizerAdded(organizer);
    }

    function getEvent(uint256 eventId) external view returns (Event memory) {
        return events[eventId];
    }

    function getTicket(uint256 ticketId) external view returns (Ticket memory) {
        return tickets[ticketId];
    }

    function getTicketsByOwner(address owner) external view returns (uint256[] memory) {
        return _ownerTickets[owner];
    }

    function getEventsByOrganizer(address organizer) external view returns (uint256[] memory) {
        uint256[] memory organizerEvents = new uint256[](_eventCounter);
        uint256 count = 0;

        for (uint256 i = 1; i <= _eventCounter; i++) {
            if (events[i].organizer == organizer) {
                organizerEvents[count] = i;
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = organizerEvents[i];
        }

        return result;
    }

    function isAttendee(uint256 eventId, address user) external view returns (bool) {
        return attendees[eventId][user];
    }

    function getAllEvents() external view returns (Event[] memory) {
        Event[] memory allEvents = new Event[](_eventCounter);
        for (uint256 i = 1; i <= _eventCounter; i++) {
            allEvents[i - 1] = events[i];
        }
        return allEvents;
    }

    function getEventCount() external view returns (uint256) {
        return _eventCounter;
    }

    function getTicketCount() external view returns (uint256) {
        return _ticketCounter;
    }

    // Override transfer functions for soulbound tickets
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        if (from != address(0) && to != address(0)) {
            Ticket storage ticket = tickets[tokenId];
            require(!ticket.isSoulbound, "Soulbound tickets cannot be transferred");
        }
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}