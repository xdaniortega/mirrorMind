// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {IIdentityVerificationHubV2} from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import {AttestationId} from "@selfxyz/contracts/contracts/constants/AttestationId.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AgentRegistry
 * @dev Registry for AI agents with user verification and payment management
 */
contract AgentRegistry is SelfVerificationRoot, Ownable, ReentrancyGuard {
    error InvalidUserAddress();
    error NameRequired();
    error PriceTooLow();
    error PriceTooHigh();
    error AmountMustBeGreaterThanZero();
    error TransferFailed();
    error InsufficientBalance();
    error AgentDoesNotExist();
    error AgentNotActive();
    error UserNotVerified();
    error NotAgentOwner();
    error TransactionDoesNotExist();
    error ServiceAlreadyCompleted();
    error FeeTooHigh();
    error NoFeesToWithdraw();
    error InvalidPriceRange();

    event AgentRegistered(uint256 indexed agentId, address indexed owner, string name, uint256 price);
    event AgentUpdated(uint256 indexed agentId, string name, uint256 price, bool isActive);
    event UserRegistered(address indexed user, bool isVerified);
    event BalanceAdded(address indexed user, uint256 amount);
    event ServicePurchased(uint256 indexed transactionId, address indexed user, uint256 indexed agentId, uint256 amount);
    event ServiceCompleted(uint256 indexed transactionId, address indexed user, uint256 indexed agentId);
    event PlatformFeeCollected(uint256 amount);
    event UserVerified(address indexed user);
    event CreatorAgentFeeCollected(uint256 amount);
    
    modifier onlyVerifiedUser() {
        if (!users[msg.sender].isVerified) {
            revert UserNotVerified();
        }
        _;
    }
    
    // Agent structure
    struct Agent {
        address owner;
        string name;
        string description;
        uint256 pricePerService; // Price in USDC (6 decimals)
        bool isActive;
        uint256 totalEarnings;
        uint256 totalServices;
        uint256 createdAt;
        string metadata; // JSON string for additional data
    }
    
    // User structure
    struct User {
        bool isVerified;
        uint256 totalSpent;
        uint256 lastActivity;
        uint256 balance;
    }
    
    // Service transaction structure
    struct ServiceTransaction {
        address user;
        uint256 agentId;
        uint256 amount;
        uint256 timestamp;
        bool completed;
        string serviceData; // JSON string for service details
    }
    
    // State variables
    mapping(uint256 => Agent) public agents;
    mapping(address => User) public users;
    mapping(uint256 => ServiceTransaction) public transactions;
    mapping(address => uint256[]) public userTransactions;
    mapping(uint256 => uint256[]) public agentTransactions;
    
    // Counters
    uint256 public nextAgentId = 1;
    uint256 public nextTransactionId = 1;
    uint256 public totalAgents = 0;
    uint256 public totalUsers = 0;
    uint256 public totalRevenue = 0;
    
    // Configuration
    uint256 public platformFee = 500; // 5% (500 basis points)
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public minimumServicePrice = 1000000; // 1 USDC minimum
    uint256 public maximumServicePrice = 1000000000; // 1000 USDC maximum
    uint256 public creatorAgentFee = 50000000; // 50 USDC (50 * 10^6)
    
    // USDC token address (Celo USDC)
    IERC20 public paymentToken;
    
    constructor(
        address _identityVerificationHubV2,
        uint256 _scope,
        address _paymentToken
    ) 
        SelfVerificationRoot(_identityVerificationHubV2, _scope)
        Ownable(msg.sender)
    {
        paymentToken = IERC20(_paymentToken);
    }
    
    // Self Protocol integration
    function getConfigId(
        bytes32 destinationChainId,
        bytes32 userIdentifier, 
        bytes memory userDefinedData
    ) public view override returns (bytes32) {
        // Use a default config ID for age verification
        return 0xefacbec81d9f7ce9eff069f164119208a871e933e75de0bc5d23d903581fbf27;
    }
    
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal virtual override {
        // Extract user address from userData
        address userAddress = address(0);
        if (userData.length >= 20) {
            assembly {
                userAddress := mload(add(userData, 20))
            }
        }
        
        if (userAddress == address(0)) {
            revert InvalidUserAddress();
        }
        
        // Register or update user verification status
        if (users[userAddress].lastActivity == 0) {
            totalUsers++;
        }
        
        users[userAddress].isVerified = true;
        users[userAddress].lastActivity = block.timestamp;
        
        emit UserVerified(
            userAddress);
    }
    
    // Agent management functions
    function registerAgent(
        string memory name,
        string memory description,
        uint256 pricePerService,
        string memory metadata
    ) external onlyVerifiedUser returns (uint256) {
        if (bytes(name).length == 0) {
            revert NameRequired();
        }
        if (pricePerService < minimumServicePrice) {
            revert PriceTooLow();
        }
        if (pricePerService > maximumServicePrice) {
            revert PriceTooHigh();
        }
        
        // Transfer creator fee from user to contract
        if (!paymentToken.transferFrom(msg.sender, address(this), creatorAgentFee)) {
            revert TransferFailed();
        }
        
        uint256 agentId = nextAgentId++;
        
        agents[agentId] = Agent({
            owner: msg.sender,
            name: name,
            description: description,
            pricePerService: pricePerService,
            isActive: true,
            totalEarnings: 0,
            totalServices: 0,
            createdAt: block.timestamp,
            metadata: metadata
        });
        
        totalAgents++;
        
        emit AgentRegistered(agentId, msg.sender, name, pricePerService);
        emit CreatorAgentFeeCollected(creatorAgentFee);
        return agentId;
    }
    
    function updateAgent(
        uint256 agentId,
        string memory name,
        string memory description,
        uint256 pricePerService,
        bool isActive,
        string memory metadata
    ) external {
        if (agents[agentId].owner != msg.sender) {
            revert NotAgentOwner();
        }
        if (agentId == 0 || agentId >= nextAgentId) {
            revert AgentDoesNotExist();
        }
        if (bytes(name).length == 0) {
            revert NameRequired();
        }
        if (pricePerService < minimumServicePrice) {
            revert PriceTooLow();
        }
        if (pricePerService > maximumServicePrice) {
            revert PriceTooHigh();
        }
        
        Agent storage agent = agents[agentId];
        agent.name = name;
        agent.description = description;
        agent.pricePerService = pricePerService;
        agent.isActive = isActive;
        agent.metadata = metadata;
        
        emit AgentUpdated(agentId, name, pricePerService, isActive);
    }
    
    function deactivateAgent(uint256 agentId) external {
        if (agents[agentId].owner != msg.sender) {
            revert NotAgentOwner();
        }
        if (agentId == 0 || agentId >= nextAgentId) {
            revert AgentDoesNotExist();
        }
        agents[agentId].isActive = false;
        emit AgentUpdated(agentId, agents[agentId].name, agents[agentId].pricePerService, false);
    }
    
    // User management functions
    function addBalance(uint256 amount) external nonReentrant {
        if (amount == 0) {
            revert AmountMustBeGreaterThanZero();
        }
        
        // Transfer USDC from user to contract
        if (!paymentToken.transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed();
        }
        
        if (users[msg.sender].lastActivity == 0) {
            totalUsers++;
        }
        
        users[msg.sender].balance += amount;
        users[msg.sender].lastActivity = block.timestamp;
        
        emit BalanceAdded(msg.sender, amount);
    }
    
    function withdrawBalance(uint256 amount) external nonReentrant {
        if (amount == 0) {
            revert AmountMustBeGreaterThanZero();
        }
        if (users[msg.sender].balance < amount) {
            revert InsufficientBalance();
        }
        
        users[msg.sender].balance -= amount;
        users[msg.sender].lastActivity = block.timestamp;
        
        if (!paymentToken.transfer(msg.sender, amount)) {
            revert TransferFailed();
        }
        emit BalanceAdded(msg.sender, amount);
    }
    
    // Service purchase functions
    function purchaseService(
        uint256 agentId,
        string memory serviceData
    ) external 
        nonReentrant 
    {
        if (agentId == 0 || agentId >= nextAgentId) {
            revert AgentDoesNotExist();
        }
        if (!agents[agentId].isActive) {
            revert AgentNotActive();
        }
        if (!users[msg.sender].isVerified) {
            revert UserNotVerified();
        }
        if (users[msg.sender].balance < agents[agentId].pricePerService) {
            revert InsufficientBalance();
        }
        
        uint256 amount = agents[agentId].pricePerService;
        uint256 transactionId = nextTransactionId++;
        
        // Calculate platform fee
        uint256 platformFeeAmount = (amount * platformFee) / BASIS_POINTS;
        uint256 agentAmount = amount - platformFeeAmount;
        
        // Deduct from user balance
        users[msg.sender].balance -= amount;
        users[msg.sender].totalSpent += amount;
        users[msg.sender].lastActivity = block.timestamp;
        
        // Update agent earnings
        agents[agentId].totalEarnings += agentAmount;
        agents[agentId].totalServices++;
        
        // Create transaction record
        transactions[transactionId] = ServiceTransaction({
            user: msg.sender,
            agentId: agentId,
            amount: amount,
            timestamp: block.timestamp,
            completed: false,
            serviceData: serviceData
        });
        
        // Update mappings
        userTransactions[msg.sender].push(transactionId);
        agentTransactions[agentId].push(transactionId);
        
        totalRevenue += amount;
        
        emit ServicePurchased(transactionId, msg.sender, agentId, amount);
    }
    
    function completeService(uint256 transactionId) external {
        ServiceTransaction storage transaction = transactions[transactionId];
        if (transaction.user == address(0)) {
            revert TransactionDoesNotExist();
        }
        if (transaction.completed) {
            revert ServiceAlreadyCompleted();
        }
        if (agents[transaction.agentId].owner != msg.sender) {
            revert NotAgentOwner();
        }
        
        transaction.completed = true;
        
        emit ServiceCompleted(transactionId, transaction.user, transaction.agentId);
    }
    
    // View functions
    function getAgent(uint256 agentId) external view returns (Agent memory) {
        if (agentId == 0 || agentId >= nextAgentId) {
            revert AgentDoesNotExist();
        }
        return agents[agentId];
    }
    
    function getUser(address user) external view returns (User memory) {
        return users[user];
    }
    
    function getTransaction(uint256 transactionId) external view returns (ServiceTransaction memory) {
        return transactions[transactionId];
    }
    
    function getUserTransactions(address user) external view returns (uint256[] memory) {
        return userTransactions[user];
    }
    
    function getAgentTransactions(uint256 agentId) external view returns (uint256[] memory) {
        if (agentId == 0 || agentId >= nextAgentId) {
            revert AgentDoesNotExist();
        }
        return agentTransactions[agentId];
    }
    
    function getAgentsByOwner(address owner) external view returns (uint256[] memory) {
        uint256[] memory agentIds = new uint256[](totalAgents);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextAgentId; i++) {
            if (agents[i].owner == owner) {
                agentIds[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        assembly {
            mstore(agentIds, count)
        }
        
        return agentIds;
    }
    
    function getActiveAgents() external view returns (uint256[] memory) {
        uint256[] memory agentIds = new uint256[](totalAgents);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextAgentId; i++) {
            if (agents[i].isActive) {
                agentIds[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        assembly {
            mstore(agentIds, count)
        }
        
        return agentIds;
    }
    
    // Admin functions
    function setPlatformFee(uint256 newFee) external onlyOwner {
        if (newFee > 2000) {
            revert FeeTooHigh(); // Max 20%
        }
        platformFee = newFee;
    }
    
    function setCreatorAgentFee(uint256 newFee) external onlyOwner {
        creatorAgentFee = newFee;
    }
    
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        if (balance == 0) {
            revert NoFeesToWithdraw();
        }
        
        if (!paymentToken.transfer(owner(), balance)) {
            revert TransferFailed();
        }
        emit PlatformFeeCollected(balance);
    }
}
