// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMedBatch {
    enum BatchStatus { Manufactured, InTransit, Delivered, Expired }

    struct DrugBatch {
        bytes32     batchId;
        string      drugName;
        string      region;
        uint256     quantity;
        uint256     manufactureDate;
        uint256     expiryDate;
        string      qrCodeHash;
        address     registeredBy;
        address     currentOwner;
        BatchStatus status;
        bool        isActive;
        uint256     registeredAt;
    }

    function getBatch(bytes32 batchId) external view returns (DrugBatch memory);
    function verifyBatch(bytes32 batchId) external view returns (
        bool isValid, string memory drugName, string memory region,
        uint256 expiryDate, address currentOwner, string memory ownerName,
        BatchStatus status
    );
    function updateOwner(bytes32 batchId, address newOwner) external;
    function updateStatus(bytes32 batchId, uint8 newStatus) external;
    function batchExists(bytes32 batchId) external view returns (bool);
    function getBatchesByOwner(address owner) external view returns (bytes32[] memory);
    function getBatchesByManufacturer(address manufacturer) external view returns (bytes32[] memory);
}
