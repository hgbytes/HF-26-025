// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMedAudit {
    struct AuditEntry {
        bytes32 entryId;
        bytes32 batchId;
        string  action;
        address performedBy;
        uint256 timestamp;
        string  metadata;
    }

    function logAction(bytes32 batchId, string calldata action, string calldata metadata) external;
    function getAuditTrail(bytes32 batchId) external view returns (AuditEntry[] memory);
    function getExpiringBatches(uint256 withinDays) external view returns (bytes32[] memory);
    function flagAnomaly(bytes32 batchId, string calldata anomalyType, string calldata notes) external;
}
