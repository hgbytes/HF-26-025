// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IMedAccessControl.sol";
import "./interfaces/IMedBatch.sol";
import "./interfaces/IMedAudit.sol";

/**
 * @title MedTransfer
 * @notice Distributor-facing ownership-handoff contract for batch transfers.
 */
contract MedTransfer {
    IMedAccessControl public accessControl;
    IMedBatch public medBatch;
    IMedAudit public audit;

    enum TransferStatus { Pending, Accepted, Rejected, Cancelled }

    struct Transfer {
        bytes32        transferId;
        bytes32        batchId;
        address        from;
        address        to;
        uint256        quantity;
        string         fromRegion;
        string         toRegion;
        uint256        initiatedAt;
        uint256        completedAt;
        TransferStatus status;
        string         rejectionReason;
    }

    mapping(bytes32 => Transfer) public transfers;
    mapping(bytes32 => bytes32[]) public transfersByBatch;
    mapping(address => bytes32[]) public pendingByWallet;
    uint256 public transferCount;

    // --- Events ---
    event TransferInitiated(bytes32 indexed transferId, bytes32 indexed batchId, address indexed from, address to, uint256 quantity);
    event TransferAccepted(bytes32 indexed transferId, address indexed acceptedBy, uint256 timestamp);
    event TransferRejected(bytes32 indexed transferId, string reason);
    event TransferCancelled(bytes32 indexed transferId);

    modifier onlyManufacturerOrDistributor() {
        require(
            accessControl.isManufacturer(msg.sender) || accessControl.isDistributor(msg.sender),
            "MedTransfer: unauthorized role"
        );
        _;
    }

    modifier onlyDistributor() {
        require(accessControl.isDistributor(msg.sender), "MedTransfer: caller is not distributor");
        _;
    }

    modifier whenNotPaused() {
        require(!accessControl.paused(), "MedTransfer: paused");
        _;
    }

    constructor(address _accessControl, address _batch, address _audit) {
        accessControl = IMedAccessControl(_accessControl);
        medBatch = IMedBatch(_batch);
        audit = IMedAudit(_audit);
    }

    // ── Initiate ────────────────────────────────────────────────────

    function initiateTransfer(
        bytes32 batchId,
        address to,
        uint256 quantity,
        string calldata toRegion
    ) external onlyManufacturerOrDistributor whenNotPaused returns (bytes32) {
        require(medBatch.batchExists(batchId), "MedTransfer: batch does not exist");
        IMedBatch.DrugBatch memory b = medBatch.getBatch(batchId);
        require(b.isActive, "MedTransfer: batch not active");
        require(b.currentOwner == msg.sender, "MedTransfer: caller is not batch owner");
        require(accessControl.isDistributor(to), "MedTransfer: receiver is not distributor");
        require(quantity > 0, "MedTransfer: quantity must be > 0");
        require(quantity <= b.quantity, "MedTransfer: quantity exceeds batch");

        transferCount++;
        bytes32 transferId = keccak256(abi.encodePacked(batchId, msg.sender, to, block.timestamp, transferCount));

        Transfer storage t = transfers[transferId];
        t.transferId = transferId;
        t.batchId = batchId;
        t.from = msg.sender;
        t.to = to;
        t.quantity = quantity;
        t.initiatedAt = block.timestamp;
        t.fromRegion = b.region;
        t.toRegion = toRegion;
        t.status = TransferStatus.Pending;

        transfersByBatch[batchId].push(transferId);
        pendingByWallet[to].push(transferId);

        // Update batch status → InTransit
        medBatch.updateStatus(batchId, 1); // InTransit

        // Audit log
        audit.logAction(batchId, "TRANSFER_INITIATED", toRegion);

        emit TransferInitiated(transferId, batchId, msg.sender, to, quantity);
        return transferId;
    }

    // ── Accept (receiver only) ──────────────────────────────────────

    function acceptTransfer(bytes32 transferId) external onlyDistributor whenNotPaused {
        Transfer storage t = transfers[transferId];
        require(t.to == msg.sender, "MedTransfer: only receiver can accept");
        require(t.status == TransferStatus.Pending, "MedTransfer: not pending");

        t.status = TransferStatus.Accepted;
        t.completedAt = block.timestamp;

        // Update batch owner and status
        medBatch.updateOwner(t.batchId, msg.sender);
        medBatch.updateStatus(t.batchId, 2); // Delivered

        // Remove from pending
        _removeFromPending(msg.sender, transferId);

        // Audit log
        audit.logAction(t.batchId, "TRANSFER_ACCEPTED", "");

        emit TransferAccepted(transferId, msg.sender, block.timestamp);
    }

    // ── Reject (receiver only) ──────────────────────────────────────

    function rejectTransfer(bytes32 transferId, string calldata reason) external onlyDistributor whenNotPaused {
        Transfer storage t = transfers[transferId];
        require(t.to == msg.sender, "MedTransfer: only receiver can reject");
        require(t.status == TransferStatus.Pending, "MedTransfer: not pending");

        t.status = TransferStatus.Rejected;
        t.completedAt = block.timestamp;
        t.rejectionReason = reason;

        // Revert batch status → Manufactured
        medBatch.updateStatus(t.batchId, 0); // Manufactured

        // Remove from pending
        _removeFromPending(msg.sender, transferId);

        // Audit log
        audit.logAction(t.batchId, "TRANSFER_REJECTED", reason);

        emit TransferRejected(transferId, reason);
    }

    // ── Cancel (sender only) ────────────────────────────────────────

    function cancelTransfer(bytes32 transferId) external whenNotPaused {
        Transfer storage t = transfers[transferId];
        require(t.from == msg.sender, "MedTransfer: only sender can cancel");
        require(t.status == TransferStatus.Pending, "MedTransfer: not pending");

        t.status = TransferStatus.Cancelled;
        t.completedAt = block.timestamp;

        // Revert batch status → Manufactured
        medBatch.updateStatus(t.batchId, 0); // Manufactured

        // Remove from pending
        _removeFromPending(t.to, transferId);

        // Audit log
        audit.logAction(t.batchId, "TRANSFER_CANCELLED", "");

        emit TransferCancelled(transferId);
    }

    // ── Public reads ────────────────────────────────────────────────

    function getTransfer(bytes32 transferId) external view returns (Transfer memory) {
        return transfers[transferId];
    }

    function getTransferHistory(bytes32 batchId) external view returns (Transfer[] memory) {
        bytes32[] memory ids = transfersByBatch[batchId];
        Transfer[] memory result = new Transfer[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = transfers[ids[i]];
        }
        return result;
    }

    function getPendingTransfers(address wallet) external view returns (Transfer[] memory) {
        bytes32[] memory ids = pendingByWallet[wallet];
        uint256 count = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (transfers[ids[i]].status == TransferStatus.Pending) count++;
        }
        Transfer[] memory result = new Transfer[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (transfers[ids[i]].status == TransferStatus.Pending) {
                result[idx] = transfers[ids[i]];
                idx++;
            }
        }
        return result;
    }

    function getCurrentOwner(bytes32 batchId) external view returns (address) {
        IMedBatch.DrugBatch memory b = medBatch.getBatch(batchId);
        return b.currentOwner;
    }

    function getCompletedTransfers(address wallet) external view returns (Transfer[] memory) {
        // Scan all transfers by batch for this wallet
        // This is a convenience view — for gas-heavy scenarios use off-chain indexing
        bytes32[] memory ids = pendingByWallet[wallet];
        uint256 count = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (transfers[ids[i]].status != TransferStatus.Pending) count++;
        }
        Transfer[] memory result = new Transfer[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (transfers[ids[i]].status != TransferStatus.Pending) {
                result[idx] = transfers[ids[i]];
                idx++;
            }
        }
        return result;
    }

    // ── Internal ────────────────────────────────────────────────────

    function _removeFromPending(address wallet, bytes32 transferId) internal {
        bytes32[] storage list = pendingByWallet[wallet];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == transferId) {
                list[i] = list[list.length - 1];
                list.pop();
                break;
            }
        }
    }
}
