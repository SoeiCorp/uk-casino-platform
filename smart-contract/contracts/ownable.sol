// SPDX-License-Identifier: Non-License
pragma solidity ^0.8.27;

/**
 * @title Owner
 * @dev Set & change owner
 */
contract Ownable {
    address private owner;

    // modifier to check if caller is owner
    modifier onlyOwner() {
        require(msg.sender == owner, "unauthorized");
        _;
    }

    /**
     * @dev Set contract deployer as owner
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Change owner
     * @param newOwner address of new owner
     */
    function changeOwner(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    /**
     * @dev Return owner address
     * @return address of owner
     */
    function getOwner() public view returns (address) {
        return owner;
    }
}
