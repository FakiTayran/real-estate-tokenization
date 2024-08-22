// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Neighborhood is ERC721, Ownable {
    struct LeasePeriod {
        uint256 startTime;
        uint256 endTime;
    }
    struct PropertyInfo {
        string titleNumber;
        string propertyAddress;
        bool onSale;
        bool onLease;
        uint256 sellPrice;
        uint256 leasePrice;
        uint256 agentCommission;
        address agentAddress;
        address owner;
        uint256 squareMeters;
        string sterlinPrice;
    }

    struct Property {
        string titleNumber;
        string propertyAddress;
        bool onSale;
        bool onLease;
        uint256 sellPrice;
        uint256 leasePrice;
        LeasePeriod leasePeriod;
        uint256 leaseDeadline;
        uint256 agentCommission;
        address agentAddress;
        address owner;
        uint256 squareMeters;
        string sterlinPrice;
    }

    struct Agent {
        address agentAddress;
    }

    mapping(uint256 => Property) public apartments;
    mapping(string => Agent) public agents;
    mapping(uint256 => uint256) public apartmentToAgent;

    constructor() ERC721("Neighborhood", "APT") Ownable(msg.sender) {
        // Initialize with dummy data
        agents["64ed85e7-0283-4c5d-bea1-24aee0fd7c2e"] = Agent({
            agentAddress: 0x39Cf53EE4fed0e74E543C3668D5bAD9C6C32797b
        });

        apartments[1] = Property({
            titleNumber: "TN12345",
            propertyAddress: "123 Main St, Brighton, BN2 1DG",
            onSale: true,
            onLease: false,
            sellPrice: 0.0002 ether,
            leasePrice: 0.0002 ether,
            leasePeriod: LeasePeriod({startTime: 0, endTime: 0}),
            leaseDeadline: block.timestamp + 720 days,
            agentCommission: 0.00001 ether,
            agentAddress: agents["64ed85e7-0283-4c5d-bea1-24aee0fd7c2e"]
                .agentAddress,
            owner: 0x39Cf53EE4fed0e74E543C3668D5bAD9C6C32797b,
            squareMeters: 45,
            sterlinPrice: "1350"
        });

        apartments[2] = Property({
            titleNumber: "TN67890",
            propertyAddress: "456 Oak St, Brighton, BN2 1TN ",
            onSale: true,
            onLease: false,
            sellPrice: 0.0001 ether,
            leasePrice: 0.0001 ether,
            leasePeriod: LeasePeriod({startTime: 0, endTime: 0}),
            leaseDeadline: block.timestamp + 12 days,
            agentCommission: 0.00001 ether,
            agentAddress: agents["64ed85e7-0283-4c5d-bea1-24aee0fd7c2e"]
                .agentAddress,
            owner: 0x39Cf53EE4fed0e74E543C3668D5bAD9C6C32797b,
            squareMeters: 75,
            sterlinPrice: "99999"
        });

        apartments[108] = Property({
            titleNumber: "TN11121",
            propertyAddress: "789 Pine St, Brighton, BN2 1DG",
            onSale: false,
            onLease: true,
            sellPrice: 0.0005 ether,
            leasePrice: 0.0005 ether,
            leasePeriod: LeasePeriod({startTime: 0, endTime: 0}),
            leaseDeadline: block.timestamp + 360 days,
            agentCommission: 0.00001 ether,
            agentAddress: agents["64ed85e7-0283-4c5d-bea1-24aee0fd7c2e"]
                .agentAddress,
            owner: 0x39Cf53EE4fed0e74E543C3668D5bAD9C6C32797b,
            squareMeters: 75,
            sterlinPrice: "50000"
        });

        // Mint tokens for the initialized apartments
        _adminMint(1);
        _adminMint(2);
        _adminMint(108);
    }

    function _adminMint(uint256 tokenId) internal onlyOwner {
        _mint(owner(), tokenId);
    }

    function buy(string memory agentId, uint256 tokenId) external payable {
        Property memory property = apartments[tokenId];
        require(property.onSale, "Property is not for sale");
        require(
            msg.value >= property.sellPrice,
            "Insufficient MATIC to buy the property"
        );

        uint256 agentCommission = property.agentCommission;
        address agentAddress = agents[agentId].agentAddress;

        require(agentAddress == property.agentAddress, "Invalid agent");

        payable(agentAddress).transfer(agentCommission);
        payable(property.owner).transfer(msg.value - agentCommission);

        property.onSale = false;
        property.owner = msg.sender;
        apartments[tokenId] = property;

        _transfer(owner(), msg.sender, tokenId);
    }

    // function rent(uint256 tokenId, uint256 leaseDuration) external payable {
    //     Property memory property = apartments[tokenId];
    //     require(block.timestamp + leaseDuration <= property.leaseDeadline, "Lease duration exceeds the deadline");
    //     require(msg.value >= property.leasePrice * leaseDuration, "Insufficient MATIC to lease the property");
    //     require(!property.onLease, "Property is already on lease");

    //     property.leasePeriod = LeasePeriod({
    //         startTime: block.timestamp,
    //         endTime: block.timestamp + leaseDuration
    //     });
    //     property.onLease = true;
    //     apartments[tokenId] = property;

    //     payable(property.owner).transfer(msg.value);
    // }

    function changeSaleStatus(
        uint256 tokenId,
        bool onSale,
        uint256 newSellPrice
    ) external {
        Property storage property = apartments[tokenId];
        require(
            msg.sender == property.owner,
            "Only the owner can change the sale status"
        );
        property.onSale = onSale;
        property.sellPrice = newSellPrice;
    }

    function getProperty(
        uint256 tokenId
    ) public view returns (PropertyInfo memory info) {
        Property storage property = apartments[tokenId];
        return
            PropertyInfo({
                titleNumber: property.titleNumber,
                propertyAddress: property.propertyAddress,
                onSale: property.onSale,
                onLease: property.onLease,
                sellPrice: property.sellPrice,
                leasePrice: property.leasePrice,
                agentCommission: property.agentCommission,
                agentAddress: property.agentAddress,
                owner: property.owner,
                sterlinPrice: property.sterlinPrice,
                squareMeters: property.squareMeters
            });
    }
}