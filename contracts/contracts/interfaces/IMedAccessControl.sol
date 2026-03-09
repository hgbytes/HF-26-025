// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMedAccessControl {
    function ADMIN_ROLE() external view returns (bytes32);
    function MANUFACTURER_ROLE() external view returns (bytes32);
    function DISTRIBUTOR_ROLE() external view returns (bytes32);
    function PATIENT_ROLE() external view returns (bytes32);
    function hasRole(bytes32 role, address account) external view returns (bool);
    function isManufacturer(address wallet) external view returns (bool);
    function isDistributor(address wallet) external view returns (bool);
    function isPatient(address wallet) external view returns (bool);
    function getWalletName(address wallet) external view returns (string memory);
    function paused() external view returns (bool);
}
