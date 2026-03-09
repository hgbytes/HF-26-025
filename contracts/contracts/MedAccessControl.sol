// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MedAccessControl
 * @notice Role-based access control and emergency pause for the MedChain TN supply chain.
 */
contract MedAccessControl is AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");

    mapping(address => string) public walletNames;

    event RoleGrantedCustom(address indexed wallet, bytes32 role, string name);
    event RoleRevokedCustom(address indexed wallet, bytes32 role);
    event SystemPaused(address by);
    event SystemUnpaused(address by);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MANUFACTURER_ROLE, msg.sender);
    }

    function grantManufacturerRole(address wallet, string calldata name) external onlyRole(ADMIN_ROLE) {
        _grantRole(MANUFACTURER_ROLE, wallet);
        walletNames[wallet] = name;
        emit RoleGrantedCustom(wallet, MANUFACTURER_ROLE, name);
    }

    function grantDistributorRole(address wallet, string calldata name) external onlyRole(ADMIN_ROLE) {
        _grantRole(DISTRIBUTOR_ROLE, wallet);
        walletNames[wallet] = name;
        emit RoleGrantedCustom(wallet, DISTRIBUTOR_ROLE, name);
    }

    function grantPatientRole(address wallet) external onlyRole(ADMIN_ROLE) {
        _grantRole(PATIENT_ROLE, wallet);
        emit RoleGrantedCustom(wallet, PATIENT_ROLE, "");
    }

    function revokeUserRole(address wallet, bytes32 role) external onlyRole(ADMIN_ROLE) {
        _revokeRole(role, wallet);
        emit RoleRevokedCustom(wallet, role);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
        emit SystemPaused(msg.sender);
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit SystemUnpaused(msg.sender);
    }

    // ── Read Functions ──────────────────────────────────────────────

    function isManufacturer(address wallet) external view returns (bool) {
        return hasRole(MANUFACTURER_ROLE, wallet);
    }

    function isDistributor(address wallet) external view returns (bool) {
        return hasRole(DISTRIBUTOR_ROLE, wallet);
    }

    function isPatient(address wallet) external view returns (bool) {
        return hasRole(PATIENT_ROLE, wallet);
    }

    function getWalletName(address wallet) external view returns (string memory) {
        return walletNames[wallet];
    }
}
