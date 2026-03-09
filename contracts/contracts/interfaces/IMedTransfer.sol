// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMedTransfer {
    struct Transfer {
        bytes32 transferId;
        bytes32 batchId;
        address from;
        address to;
        uint256 quantity;
        string  fromRegion;
        string  toRegion;
        uint256 initiatedAt;
        uint256 completedAt;
        uint8   status;
        string  rejectionReason;
    }

    function getTransferHistory(bytes32 batchId) external view returns (Transfer[] memory);
    function getPendingTransfers(address wallet) external view returns (Transfer[] memory);
    function getCurrentOwner(bytes32 batchId) external view returns (address);
}
