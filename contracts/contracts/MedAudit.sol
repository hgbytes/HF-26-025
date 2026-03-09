// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IMedAccessControl.sol";
import "./interfaces/IMedBatch.sol";

/**
 * @title MedAudit
 * @notice Immutable on-chain audit trail, expiry management, and anomaly flagging.
 */
contract MedAudit {
    IMedAccessControl public accessControl;
    IMedBatch public medBatch;

    struct AuditEntry {
        bytes32 entryId;
        bytes32 batchId;
        string  action;
        address performedBy;
        uint256 timestamp;
        string  metadata;
    }

    mapping(bytes32 => AuditEntry[]) public auditByBatch;
    mapping(address => AuditEntry[]) public auditByWallet;
    AuditEntry[] public allEntries;
    uint256 public entryCount;

    mapping(address => bool) public authorizedContracts;

    bytes32[] private allBatchIds;
    mapping(bytes32 => bool) private batchIdKnown;

    // --- Events ---
    event ActionLogged(bytes32 indexed batchId, string action, address indexed performedBy, uint256 timestamp);
    event BatchMarkedExpired(bytes32 indexed batchId, uint256 expiryDate);
    event ExpiryWarning(bytes32 indexed batchId, uint256 daysRemaining);
    event AnomalyFlagged(bytes32 indexed batchId, string anomalyType, address flaggedBy);

    modifier onlyAdmin() {
        require(
            accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender),
            "MedAudit: caller is not admin"
        );
        _;
    }

    modifier onlyAuthorized() {
        require(
            authorizedContracts[msg.sender] ||
            accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender),
            "MedAudit: unauthorized caller"
        );
        _;
    }

    modifier onlyBackendOrManufacturer() {
        require(
            accessControl.isManufacturer(msg.sender) ||
            accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender) ||
            authorizedContracts[msg.sender],
            "MedAudit: unauthorized caller"
        );
        _;
    }

    modifier whenNotPaused() {
        require(!accessControl.paused(), "MedAudit: paused");
        _;
    }

    constructor(address _accessControl, address _medBatch) {
        accessControl = IMedAccessControl(_accessControl);
        if (_medBatch != address(0)) {
            medBatch = IMedBatch(_medBatch);
        }
    }

    function setBatchContract(address _medBatch) external onlyAdmin {
        medBatch = IMedBatch(_medBatch);
    }

    function authorizeContract(address _contract) external onlyAdmin {
        authorizedContracts[_contract] = true;
    }

    function deauthorizeContract(address _contract) external onlyAdmin {
        authorizedContracts[_contract] = false;
    }

    // ── Log action ──────────────────────────────────────────────────

    function logAction(
        bytes32 batchId,
        string calldata action,
        string calldata metadata
    ) external onlyAuthorized whenNotPaused {
        _log(batchId, action, msg.sender, metadata);
    }

    // ── Expiry management ───────────────────────────────────────────

    function checkAndMarkExpired(bytes32 batchId) external whenNotPaused {
        IMedBatch.DrugBatch memory b = medBatch.getBatch(batchId);
        require(b.isActive, "MedAudit: batch not active");
        require(block.timestamp > b.expiryDate, "MedAudit: not yet expired");

        medBatch.updateStatus(batchId, 3); // Expired
        _log(batchId, "BATCH_EXPIRED", msg.sender, "");

        emit BatchMarkedExpired(batchId, b.expiryDate);
    }

    // ── Anomaly flagging ────────────────────────────────────────────

    function flagAnomaly(
        bytes32 batchId,
        string calldata anomalyType,
        string calldata notes
    ) external onlyBackendOrManufacturer whenNotPaused {
        _log(batchId, "ANOMALY_FLAGGED", msg.sender, string.concat(anomalyType, "|", notes));

        emit AnomalyFlagged(batchId, anomalyType, msg.sender);
    }

    // ── Public reads ────────────────────────────────────────────────

    function getAuditTrail(bytes32 batchId) external view returns (AuditEntry[] memory) {
        return auditByBatch[batchId];
    }

    function getAuditByWallet(address wallet) external view returns (AuditEntry[] memory) {
        return auditByWallet[wallet];
    }

    function getExpiringBatches(uint256 withinDays) external view returns (bytes32[] memory) {
        uint256 threshold = block.timestamp + (withinDays * 1 days);
        uint256 count = 0;

        for (uint256 i = 0; i < allBatchIds.length; i++) {
            IMedBatch.DrugBatch memory b = medBatch.getBatch(allBatchIds[i]);
            if (b.isActive && b.expiryDate <= threshold && b.status != IMedBatch.BatchStatus.Expired) {
                count++;
            }
        }

        bytes32[] memory result = new bytes32[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < allBatchIds.length; i++) {
            IMedBatch.DrugBatch memory b = medBatch.getBatch(allBatchIds[i]);
            if (b.isActive && b.expiryDate <= threshold && b.status != IMedBatch.BatchStatus.Expired) {
                result[idx] = allBatchIds[i];
                idx++;
            }
        }
        return result;
    }

    function getLatestAction(bytes32 batchId) external view returns (AuditEntry memory) {
        AuditEntry[] storage trail = auditByBatch[batchId];
        require(trail.length > 0, "MedAudit: no entries");
        return trail[trail.length - 1];
    }

    function getEntryCount(bytes32 batchId) external view returns (uint256) {
        return auditByBatch[batchId].length;
    }

    // ── Internal ────────────────────────────────────────────────────

    function _log(bytes32 batchId, string memory action, address performer, string memory metadata) internal {
        entryCount++;
        bytes32 entryId = keccak256(abi.encodePacked(batchId, action, performer, block.timestamp, entryCount));

        AuditEntry memory e = AuditEntry({
            entryId: entryId,
            batchId: batchId,
            action: action,
            performedBy: performer,
            timestamp: block.timestamp,
            metadata: metadata
        });

        auditByBatch[batchId].push(e);
        auditByWallet[performer].push(e);
        allEntries.push(e);

        // Track batch ID for expiry scanning
        if (!batchIdKnown[batchId]) {
            batchIdKnown[batchId] = true;
            allBatchIds.push(batchId);
        }

        emit ActionLogged(batchId, action, performer, block.timestamp);
    }
}
