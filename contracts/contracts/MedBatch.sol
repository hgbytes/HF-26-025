// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IMedAccessControl.sol";
import "./interfaces/IMedAudit.sol";

/**
 * @title MedBatch
 * @notice Manufacturer drug-batch registration, QR-hash storage, and verification.
 */
contract MedBatch {
    IMedAccessControl public accessControl;
    IMedAudit public audit;
    address public transferContract;

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

    mapping(bytes32 => DrugBatch) public batches;
    mapping(address => bytes32[]) public batchesByManufacturer;
    mapping(address => bytes32[]) public batchesByOwner;
    uint256 public batchCount;

    // --- Events ---
    event BatchRegistered(bytes32 indexed batchId, string drugName, string region, address indexed manufacturer, uint256 expiryDate);
    event BatchDeactivated(bytes32 indexed batchId, string reason);
    event BatchStatusUpdated(bytes32 indexed batchId, BatchStatus newStatus);
    event OwnerUpdated(bytes32 indexed batchId, address from, address to);

    modifier onlyManufacturer() {
        require(accessControl.isManufacturer(msg.sender), "MedBatch: caller is not manufacturer");
        _;
    }

    modifier onlyAdmin() {
        require(
            accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender),
            "MedBatch: caller is not admin"
        );
        _;
    }

    modifier onlyTransferContract() {
        require(msg.sender == transferContract, "MedBatch: caller is not transfer contract");
        _;
    }

    modifier onlyTransferOrAudit() {
        require(
            msg.sender == transferContract || msg.sender == address(audit),
            "MedBatch: unauthorized caller"
        );
        _;
    }

    modifier whenNotPaused() {
        require(!accessControl.paused(), "MedBatch: paused");
        _;
    }

    constructor(address _accessControl, address _audit) {
        accessControl = IMedAccessControl(_accessControl);
        audit = IMedAudit(_audit);
    }

    function setTransferContract(address _transfer) external onlyAdmin {
        transferContract = _transfer;
    }

    // ── Manufacturer-only writes ────────────────────────────────────

    function registerBatch(
        string calldata drugName,
        string calldata region,
        uint256 quantity,
        uint256 manufactureDate,
        uint256 expiryDate,
        string calldata qrCodeHash
    ) external onlyManufacturer whenNotPaused returns (bytes32) {
        require(bytes(drugName).length > 0, "MedBatch: drugName empty");
        require(quantity > 0, "MedBatch: quantity must be > 0");
        require(expiryDate > manufactureDate, "MedBatch: expiry must be after manufacture date");

        batchCount++;
        bytes32 batchId = keccak256(abi.encodePacked(msg.sender, drugName, block.timestamp, batchCount));

        DrugBatch storage b = batches[batchId];
        b.batchId = batchId;
        b.drugName = drugName;
        b.region = region;
        b.quantity = quantity;
        b.manufactureDate = manufactureDate;
        b.expiryDate = expiryDate;
        b.qrCodeHash = qrCodeHash;
        b.registeredBy = msg.sender;
        b.currentOwner = msg.sender;
        b.status = BatchStatus.Manufactured;
        b.isActive = true;
        b.registeredAt = block.timestamp;

        batchesByManufacturer[msg.sender].push(batchId);
        batchesByOwner[msg.sender].push(batchId);

        // Log audit
        audit.logAction(batchId, "REGISTERED", string.concat(drugName, "|", region));

        emit BatchRegistered(batchId, drugName, region, msg.sender, expiryDate);
        return batchId;
    }

    function deactivateBatch(bytes32 batchId, string calldata reason) external onlyAdmin whenNotPaused {
        DrugBatch storage b = batches[batchId];
        require(b.isActive, "MedBatch: batch not active");
        b.isActive = false;

        audit.logAction(batchId, "BATCH_DEACTIVATED", reason);
        emit BatchDeactivated(batchId, reason);
    }

    // ── Called by MedTransfer / MedAudit ────────────────────────────

    function updateOwner(bytes32 batchId, address newOwner) external onlyTransferContract {
        DrugBatch storage b = batches[batchId];
        require(b.isActive, "MedBatch: batch not active");

        address oldOwner = b.currentOwner;

        // Remove from old owner's list
        _removeFromOwnerList(oldOwner, batchId);

        b.currentOwner = newOwner;
        batchesByOwner[newOwner].push(batchId);

        emit OwnerUpdated(batchId, oldOwner, newOwner);
    }

    function updateStatus(bytes32 batchId, uint8 newStatus) external onlyTransferOrAudit {
        DrugBatch storage b = batches[batchId];
        require(b.isActive, "MedBatch: batch not active");

        b.status = BatchStatus(newStatus);
        emit BatchStatusUpdated(batchId, BatchStatus(newStatus));
    }

    // ── Public reads ────────────────────────────────────────────────

    function getBatch(bytes32 batchId) external view returns (DrugBatch memory) {
        return batches[batchId];
    }

    function verifyBatch(bytes32 batchId) external view returns (
        bool isValid,
        string memory drugName,
        string memory region,
        uint256 expiryDate,
        address currentOwner,
        string memory ownerName,
        BatchStatus status
    ) {
        DrugBatch storage b = batches[batchId];
        bool valid = b.isActive && b.registeredBy != address(0) && b.status != BatchStatus.Expired;
        return (
            valid,
            b.drugName,
            b.region,
            b.expiryDate,
            b.currentOwner,
            accessControl.getWalletName(b.currentOwner),
            b.status
        );
    }

    function getBatchesByManufacturer(address manufacturer) external view returns (bytes32[] memory) {
        return batchesByManufacturer[manufacturer];
    }

    function getBatchesByOwner(address owner) external view returns (bytes32[] memory) {
        return batchesByOwner[owner];
    }

    function batchExists(bytes32 batchId) external view returns (bool) {
        return batches[batchId].registeredBy != address(0);
    }

    // ── Internal ────────────────────────────────────────────────────

    function _removeFromOwnerList(address owner, bytes32 batchId) internal {
        bytes32[] storage list = batchesByOwner[owner];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == batchId) {
                list[i] = list[list.length - 1];
                list.pop();
                break;
            }
        }
    }
}
