// Sources flattened with hardhat v3.0.0-next.21 https://hardhat.org

// SPDX-License-Identifier: MIT

// File contracts/AgentRegistry.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

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
    uint256 public creatorAgentFee = 10000; // 0.01 USDC (1 * 10^4)
    
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

    function setScope(uint256 _scope) external {
        _setScope(_scope);
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
        
        emit UserVerified(userAddress);
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


// File npm/@openzeppelin/contracts@5.3.0/access/Ownable.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File npm/@openzeppelin/contracts@5.3.0/utils/Context.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File npm/@openzeppelin/contracts@5.3.0/token/ERC20/IERC20.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}


// File npm/@openzeppelin/contracts@5.3.0/utils/ReentrancyGuard.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}


// File npm/@selfxyz/contracts@1.2.0/contracts/abstract/SelfVerificationRoot.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity 0.8.28;




/**
 * @title SelfVerificationRoot
 * @notice Abstract base contract to be integrated with self's verification infrastructure
 * @dev Provides base functionality for verifying and disclosing identity credentials
 * @author Self Team
 */
abstract contract SelfVerificationRoot is ISelfVerificationRoot {
    // ====================================================
    // Constants
    // ====================================================

    /// @notice Contract version identifier used in verification process
    /// @dev This version is included in the hub data for protocol compatibility
    uint8 constant CONTRACT_VERSION = 2;

    // ====================================================
    // Storage Variables
    // ====================================================

    /// @notice The scope value that proofs must match
    /// @dev Used to validate that submitted proofs match the expected scope
    uint256 internal _scope;

    /// @notice Reference to the identity verification hub V2 contract
    /// @dev Immutable reference used for bytes-based proof verification
    IIdentityVerificationHubV2 internal immutable _identityVerificationHubV2;

    // ====================================================
    // Errors
    // ====================================================

    /// @notice Error thrown when the data format is invalid
    /// @dev Triggered when the provided bytes data doesn't have the expected format
    error InvalidDataFormat();

    /// @notice Error thrown when onVerificationSuccess is called by an unauthorized address
    /// @dev Only the identity verification hub V2 contract can call onVerificationSuccess
    error UnauthorizedCaller();

    // ====================================================
    // Events
    // ====================================================

    /// @notice Emitted when the scope is updated
    /// @param newScope The new scope value that was set
    event ScopeUpdated(uint256 indexed newScope);

    /**
     * @notice Initializes the SelfVerificationRoot contract
     * @dev Sets up the immutable reference to the hub contract and initial scope
     * @param identityVerificationHubV2Address The address of the Identity Verification Hub V2
     * @param scopeValue The expected proof scope for user registration
     */
    constructor(address identityVerificationHubV2Address, uint256 scopeValue) {
        _identityVerificationHubV2 = IIdentityVerificationHubV2(identityVerificationHubV2Address);
        _scope = scopeValue;
    }

    /**
     * @notice Returns the current scope value
     * @dev Public view function to access the current scope setting
     * @return The scope value that proofs must match
     */
    function scope() public view returns (uint256) {
        return _scope;
    }

    /**
     * @notice Updates the scope value
     * @dev Protected internal function to change the expected scope for proofs
     * @param newScope The new scope value to set
     */
    function _setScope(uint256 newScope) internal {
        _scope = newScope;
        emit ScopeUpdated(newScope);
    }

    /**
     * @notice Verifies a self-proof using the bytes-based interface
     * @dev Parses relayer data format and validates against contract settings before calling hub V2
     * @param proofPayload Packed data from relayer in format: | 32 bytes attestationId | proof data |
     * @param userContextData User-defined data in format: | 32 bytes destChainId | 32 bytes userIdentifier | data |
     * @custom:data-format proofPayload = | 32 bytes attestationId | proofData |
     * @custom:data-format userContextData = | 32 bytes destChainId | 32 bytes userIdentifier | data |
     * @custom:data-format hubData = | 1 bytes contract version | 31 bytes buffer | 32 bytes scope | 32 bytes attestationId | proofData |
     */
    function verifySelfProof(bytes calldata proofPayload, bytes calldata userContextData) public {
        // Minimum expected length for proofData: 32 bytes attestationId + proof data
        if (proofPayload.length < 32) {
            revert InvalidDataFormat();
        }

        // Minimum userDefinedData length: 32 (destChainId) + 32 (userIdentifier) + 0 (userDefinedData) = 64 bytes
        if (userContextData.length < 64) {
            revert InvalidDataFormat();
        }

        bytes32 attestationId;
        assembly {
            // Load attestationId from the beginning of proofData (first 32 bytes)
            attestationId := calldataload(proofPayload.offset)
        }

        bytes32 destinationChainId = bytes32(userContextData[0:32]);
        bytes32 userIdentifier = bytes32(userContextData[32:64]);
        bytes memory userDefinedData = userContextData[64:];

        bytes32 configId = getConfigId(destinationChainId, userIdentifier, userDefinedData);

        // Hub data should be | 1 byte contractVersion | 31 bytes buffer | 32 bytes scope | 32 bytes attestationId | proof data
        bytes memory baseVerificationInput = abi.encodePacked(
            // 1 byte contractVersion
            CONTRACT_VERSION,
            // 31 bytes buffer (all zeros)
            bytes31(0),
            // 32 bytes scope
            _scope,
            // 32 bytes attestationId
            attestationId,
            // proof data (starts after 32 bytes attestationId)
            proofPayload[32:]
        );

        // Call hub V2 verification
        _identityVerificationHubV2.verify(baseVerificationInput, bytes.concat(configId, userContextData));
    }

    /**
     * @notice Callback function called upon successful verification by the hub contract
     * @dev Only callable by the identity verification hub V2 contract for security
     * @param output The verification output data containing disclosed identity information
     * @param userData The user-defined data passed through the verification process
     * @custom:security Only the authorized hub contract can call this function
     * @custom:flow This function decodes the output and calls the customizable verification hook
     */
    function onVerificationSuccess(bytes memory output, bytes memory userData) public {
        // Only allow the identity verification hub V2 to call this function
        if (msg.sender != address(_identityVerificationHubV2)) {
            revert UnauthorizedCaller();
        }

        ISelfVerificationRoot.GenericDiscloseOutputV2 memory genericDiscloseOutput = abi.decode(
            output,
            (ISelfVerificationRoot.GenericDiscloseOutputV2)
        );

        // Call the customizable verification hook
        customVerificationHook(genericDiscloseOutput, userData);
    }

    /**
     * @notice Generates a configId for the user
     * @dev This function should be overridden by the implementing contract to provide custom configId logic
     * @param destinationChainId The destination chain ID
     * @param userIdentifier The user identifier
     * @param userDefinedData The user defined data
     * @return The configId
     */
    function getConfigId(
        bytes32 destinationChainId,
        bytes32 userIdentifier,
        bytes memory userDefinedData
    ) public view virtual returns (bytes32) {
        // Default implementation reverts; must be overridden in derived contract
        revert("SelfVerificationRoot: getConfigId must be overridden");
    }

    /**
     * @notice Custom verification hook that can be overridden by implementing contracts
     * @dev This function is called after successful verification and hub address validation
     * @param output The verification output data from the hub containing disclosed identity information
     * @param userData The user-defined data passed through the verification process
     * @custom:override Override this function in derived contracts to add custom verification logic
     * @custom:security This function is only called after proper authentication by the hub contract
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal virtual {
        // Default implementation is empty - override in derived contracts to add custom logic
    }
}


// File npm/@selfxyz/contracts@1.2.0/contracts/constants/AttestationId.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title AttestationId Library
 * @notice This library provides attestation identifiers used across contracts.
 * @dev Currently, it contains the constant E_PASSPORT which represents the identifier
 * for an E-PASSPORT attestation computed as Poseidon("E-PASSPORT").
 */
library AttestationId {
    /**
     * @notice Identifier for an E-PASSPORT attestation.
     * @dev The identifier is computed based on the hash of "E-PASSPORT" using the Poseidon hash function.
     * Here it is hardcoded as bytes32(uint256(1)) for demonstration purposes.
     */
    bytes32 constant E_PASSPORT = bytes32(uint256(1));
    bytes32 constant EU_ID_CARD = bytes32(uint256(2));
}


// File npm/@selfxyz/contracts@1.2.0/contracts/constants/CircuitConstantsV2.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title Circuit Constants Library
 * @notice This library defines constants representing indices used to access public signals
 *         of various circuits such as register, DSC, and VC/Disclose.
 * @dev These indices map directly to specific data fields in the corresponding circuits proofs.
 */
library CircuitConstantsV2 {
    // ---------------------------
    // Register Circuit Constants
    // ---------------------------

    /**
     * @notice Index to access the nullifier in the register circuit public signals.
     */
    uint256 constant REGISTER_NULLIFIER_INDEX = 0;

    /**
     * @notice Index to access the commitment in the register circuit public signals.
     */
    uint256 constant REGISTER_COMMITMENT_INDEX = 1;

    /**
     * @notice Index to access the Merkle root in the register circuit public signals.
     */
    uint256 constant REGISTER_MERKLE_ROOT_INDEX = 2;

    // ---------------------------
    // DSC Circuit Constants
    // ---------------------------

    /**
     * @notice Index to access the tree leaf in the DSC circuit public signals.
     */
    uint256 constant DSC_TREE_LEAF_INDEX = 0;

    /**
     * @notice Index to access the CSCA root in the DSC circuit public signals.
     */
    uint256 constant DSC_CSCA_ROOT_INDEX = 1;

    // -------------------------------------
    // VC and Disclose Circuit Constants
    // -------------------------------------

    /**
     * @notice Structure containing circuit indices for a specific attestation type.
     */
    struct DiscloseIndices {
        uint256 revealedDataPackedIndex;
        uint256 forbiddenCountriesListPackedIndex;
        uint256 nullifierIndex;
        uint256 attestationIdIndex;
        uint256 merkleRootIndex;
        uint256 currentDateIndex;
        uint256 namedobSmtRootIndex;
        uint256 nameyobSmtRootIndex;
        uint256 scopeIndex;
        uint256 userIdentifierIndex;
        uint256 passportNoSmtRootIndex; // Only for passport, 99 for ID card
    }

    /**
     * @notice Returns the circuit indices for a given attestation type.
     * @param attestationId The attestation identifier.
     * @return indices The DiscloseIndices struct containing all relevant indices.
     */
    function getDiscloseIndices(bytes32 attestationId) internal pure returns (DiscloseIndices memory indices) {
        if (attestationId == AttestationId.E_PASSPORT) {
            return
                DiscloseIndices({
                    revealedDataPackedIndex: 0,
                    forbiddenCountriesListPackedIndex: 3,
                    nullifierIndex: 7,
                    attestationIdIndex: 8,
                    merkleRootIndex: 9,
                    currentDateIndex: 10,
                    namedobSmtRootIndex: 17,
                    nameyobSmtRootIndex: 18,
                    scopeIndex: 19,
                    userIdentifierIndex: 20,
                    passportNoSmtRootIndex: 16
                });
        } else if (attestationId == AttestationId.EU_ID_CARD) {
            return
                DiscloseIndices({
                    revealedDataPackedIndex: 0,
                    forbiddenCountriesListPackedIndex: 4,
                    nullifierIndex: 8,
                    attestationIdIndex: 9,
                    merkleRootIndex: 10,
                    currentDateIndex: 11,
                    namedobSmtRootIndex: 17,
                    nameyobSmtRootIndex: 18,
                    scopeIndex: 19,
                    userIdentifierIndex: 20,
                    passportNoSmtRootIndex: 99
                });
        } else {
            revert("Invalid attestation ID");
        }
    }
}


// File npm/@selfxyz/contracts@1.2.0/contracts/interfaces/IIdentityVerificationHubV2.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity 0.8.28;



/**
 * @title IIdentityVerificationHubV2
 * @notice Interface for the Identity Verification Hub V2 for verifying zero-knowledge proofs.
 * @dev Defines all external and public functions from IdentityVerificationHubImplV2.
 */
interface IIdentityVerificationHubV2 {
    // ====================================================
    // External Functions
    // ====================================================

    /**
     * @notice Registers a commitment using a register circuit proof.
     * @dev Verifies the register circuit proof and then calls the Identity Registry to register the commitment.
     * @param attestationId The attestation ID.
     * @param registerCircuitVerifierId The identifier for the register circuit verifier to use.
     * @param registerCircuitProof The register circuit proof data.
     */
    function registerCommitment(
        bytes32 attestationId,
        uint256 registerCircuitVerifierId,
        IRegisterCircuitVerifier.RegisterCircuitProof memory registerCircuitProof
    ) external;

    /**
     * @notice Registers a DSC key commitment using a DSC circuit proof.
     * @dev Verifies the DSC proof and then calls the Identity Registry to register the dsc key commitment.
     * @param attestationId The attestation ID.
     * @param dscCircuitVerifierId The identifier for the DSC circuit verifier to use.
     * @param dscCircuitProof The DSC circuit proof data.
     */
    function registerDscKeyCommitment(
        bytes32 attestationId,
        uint256 dscCircuitVerifierId,
        IDscCircuitVerifier.DscCircuitProof memory dscCircuitProof
    ) external;

    /**
     * @notice Sets verification config in V2 storage (owner only)
     * @dev The configId is automatically generated from the config content using sha256(abi.encode(config))
     * @param config The verification configuration
     * @return configId The generated config ID
     */
    function setVerificationConfigV2(
        SelfStructs.VerificationConfigV2 memory config
    ) external returns (bytes32 configId);

    /**
     * @notice Main verification function with new structured input format
     * @param baseVerificationInput The base verification input data
     * @param userContextData The user context data
     */
    function verify(bytes calldata baseVerificationInput, bytes calldata userContextData) external;

    /**
     * @notice Updates the registry address.
     * @param attestationId The attestation ID.
     * @param registryAddress The new registry address.
     */
    function updateRegistry(bytes32 attestationId, address registryAddress) external;

    /**
     * @notice Updates the VC and Disclose circuit verifier address.
     * @param attestationId The attestation ID.
     * @param vcAndDiscloseCircuitVerifierAddress The new VC and Disclose circuit verifier address.
     */
    function updateVcAndDiscloseCircuit(bytes32 attestationId, address vcAndDiscloseCircuitVerifierAddress) external;

    /**
     * @notice Updates the register circuit verifier for a specific signature type.
     * @param attestationId The attestation identifier.
     * @param typeId The signature type identifier.
     * @param verifierAddress The new register circuit verifier address.
     */
    function updateRegisterCircuitVerifier(bytes32 attestationId, uint256 typeId, address verifierAddress) external;

    /**
     * @notice Updates the DSC circuit verifier for a specific signature type.
     * @param attestationId The attestation identifier.
     * @param typeId The signature type identifier.
     * @param verifierAddress The new DSC circuit verifier address.
     */
    function updateDscVerifier(bytes32 attestationId, uint256 typeId, address verifierAddress) external;

    /**
     * @notice Batch updates register circuit verifiers.
     * @param attestationIds An array of attestation identifiers.
     * @param typeIds An array of signature type identifiers.
     * @param verifierAddresses An array of new register circuit verifier addresses.
     */
    function batchUpdateRegisterCircuitVerifiers(
        bytes32[] calldata attestationIds,
        uint256[] calldata typeIds,
        address[] calldata verifierAddresses
    ) external;

    /**
     * @notice Batch updates DSC circuit verifiers.
     * @param attestationIds An array of attestation identifiers.
     * @param typeIds An array of signature type identifiers.
     * @param verifierAddresses An array of new DSC circuit verifier addresses.
     */
    function batchUpdateDscCircuitVerifiers(
        bytes32[] calldata attestationIds,
        uint256[] calldata typeIds,
        address[] calldata verifierAddresses
    ) external;

    // ====================================================
    // External View Functions
    // ====================================================

    /**
     * @notice Returns the registry address for a given attestation ID.
     * @param attestationId The attestation ID to query.
     * @return The registry address associated with the attestation ID.
     */
    function registry(bytes32 attestationId) external view returns (address);

    /**
     * @notice Returns the disclose verifier address for a given attestation ID.
     * @param attestationId The attestation ID to query.
     * @return The disclose verifier address associated with the attestation ID.
     */
    function discloseVerifier(bytes32 attestationId) external view returns (address);

    /**
     * @notice Returns the register circuit verifier address for a given attestation ID and type ID.
     * @param attestationId The attestation ID to query.
     * @param typeId The type ID to query.
     * @return The register circuit verifier address associated with the attestation ID and type ID.
     */
    function registerCircuitVerifiers(bytes32 attestationId, uint256 typeId) external view returns (address);

    /**
     * @notice Returns the DSC circuit verifier address for a given attestation ID and type ID.
     * @param attestationId The attestation ID to query.
     * @param typeId The type ID to query.
     * @return The DSC circuit verifier address associated with the attestation ID and type ID.
     */
    function dscCircuitVerifiers(bytes32 attestationId, uint256 typeId) external view returns (address);

    /**
     * @notice Returns the merkle root timestamp for a given attestation ID and root.
     * @param attestationId The attestation ID to query.
     * @param root The merkle root to query.
     * @return The merkle root timestamp associated with the attestation ID and root.
     */
    function rootTimestamp(bytes32 attestationId, uint256 root) external view returns (uint256);

    /**
     * @notice Returns the identity commitment merkle root for a given attestation ID.
     * @param attestationId The attestation ID to query.
     * @return The identity commitment merkle root associated with the attestation ID.
     */
    function getIdentityCommitmentMerkleRoot(bytes32 attestationId) external view returns (uint256);

    /**
     * @notice Checks if a verification config exists
     * @param configId The configuration identifier
     * @return exists Whether the config exists
     */
    function verificationConfigV2Exists(bytes32 configId) external view returns (bool exists);

    // ====================================================
    // Public Functions
    // ====================================================

    /**
     * @notice Generates a config ID from a verification config
     * @param config The verification configuration
     * @return The generated config ID (sha256 hash of encoded config)
     */
    function generateConfigId(SelfStructs.VerificationConfigV2 memory config) external pure returns (bytes32);
}


// File npm/@selfxyz/contracts@1.2.0/contracts/interfaces/IDscCircuitVerifier.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title IDscCircuitVerifier
 * @notice Interface for verifying zero-knowledge proofs related to the DSC circuit.
 * @dev This interface defines the structure of a DSC circuit proof and exposes a function to verify such proofs.
 */
interface IDscCircuitVerifier {
    /**
     * @notice Represents a DSC circuit proof.
     * @param a An array of two unsigned integers representing the proof component 'a'.
     * @param b A 2x2 array of unsigned integers representing the proof component 'b'.
     * @param c An array of two unsigned integers representing the proof component 'c'.
     * @param pubSignals An array of two unsigned integers representing the public signals associated with the proof.
     */
    struct DscCircuitProof {
        uint[2] a;
        uint[2][2] b;
        uint[2] c;
        uint[2] pubSignals;
    }

    /**
     * @notice Verifies a given DSC circuit zero-knowledge proof.
     * @dev This function checks the validity of the provided DSC proof parameters.
     * @param pA The 'a' component of the proof.
     * @param pB The 'b' component of the proof.
     * @param pC The 'c' component of the proof.
     * @param pubSignals The public signals associated with the proof.
     * @return A boolean value indicating whether the provided proof is valid (true) or not (false).
     */
    function verifyProof(
        uint[2] calldata pA,
        uint[2][2] calldata pB,
        uint[2] calldata pC,
        uint[2] calldata pubSignals
    ) external view returns (bool);
}


// File npm/@selfxyz/contracts@1.2.0/contracts/interfaces/IRegisterCircuitVerifier.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity 0.8.28;
/**
 * @title IRegisterCircuitVerifier
 * @notice Interface for verifying register circuit proofs.
 * @dev This interface defines the structure of a register circuit proof and exposes a function to verify such proofs.
 */
interface IRegisterCircuitVerifier {
    /**
     * @notice Represents a register circuit proof.
     * @dev This structure encapsulates the required proof elements.
     * @param a An array of two unsigned integers representing the proof component 'a'.
     * @param b A 2x2 array of unsigned integers representing the proof component 'b'.
     * @param c An array of two unsigned integers representing the proof component 'c'.
     * @param pubSignals An array of three unsigned integers representing the public signals associated with the proof.
     */
    struct RegisterCircuitProof {
        uint[2] a;
        uint[2][2] b;
        uint[2] c;
        uint[3] pubSignals;
    }

    /**
     * @notice Verifies a given register circuit proof.
     * @dev This function checks the validity of the provided proof parameters.
     * @param a The 'a' component of the proof.
     * @param b The 'b' component of the proof.
     * @param c The 'c' component of the proof.
     * @param pubSignals The public signals associated with the proof.
     * @return isValid A boolean value indicating whether the provided proof is valid (true) or not (false).
     */
    function verifyProof(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[3] calldata pubSignals
    ) external view returns (bool isValid);
}


// File npm/@selfxyz/contracts@1.2.0/contracts/libraries/SelfStructs.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title SelfStructs
 * @dev Library containing data structures for Self protocol identity verification
 * @notice Defines structs for passport verification, EU ID verification, and generic disclosure outputs
 */
library SelfStructs {
    /**
     * @dev Header structure for Hub input containing contract version and scope information
     * @param contractVersion Version of the contract being used
     * @param scope Scope identifier for the verification request
     * @param attestationId Unique identifier for the attestation
     */
    struct HubInputHeader {
        uint8 contractVersion;
        uint256 scope;
        bytes32 attestationId;
    }

    /**
     * @dev Output structure for passport verification results
     * @param attestationId Unique identifier for the attestation
     * @param revealedDataPacked Packed binary data of revealed information
     * @param userIdentifier Unique identifier for the user
     * @param nullifier Cryptographic nullifier to prevent double-spending
     * @param forbiddenCountriesListPacked Packed list of forbidden countries (4 uint256 array)
     */
    struct PassportOutput {
        uint256 attestationId;
        bytes revealedDataPacked;
        uint256 userIdentifier;
        uint256 nullifier;
        uint256[4] forbiddenCountriesListPacked;
    }

    /**
     * @dev Output structure for EU ID verification results
     * @param attestationId Unique identifier for the attestation
     * @param revealedDataPacked Packed binary data of revealed information
     * @param userIdentifier Unique identifier for the user
     * @param nullifier Cryptographic nullifier to prevent double-spending
     * @param forbiddenCountriesListPacked Packed list of forbidden countries (4 uint256 array)
     */
    struct EuIdOutput {
        uint256 attestationId;
        bytes revealedDataPacked;
        uint256 userIdentifier;
        uint256 nullifier;
        uint256[4] forbiddenCountriesListPacked;
    }

    /// @dev OFAC verification mode: Passport number only
    uint256 constant passportNoOfac = 0;
    /// @dev OFAC verification mode: Name and date of birth
    uint256 constant nameAndDobOfac = 1;
    /// @dev OFAC verification mode: Name and year of birth
    uint256 constant nameAndYobOfac = 2;

    /**
     * @dev Generic disclosure output structure (Version 2) with detailed personal information
     * @param attestationId Unique identifier for the attestation
     * @param userIdentifier Unique identifier for the user
     * @param nullifier Cryptographic nullifier to prevent double-spending
     * @param forbiddenCountriesListPacked Packed list of forbidden countries (4 uint256 array)
     * @param issuingState Country or state that issued the document
     * @param name Array of name components (first, middle, last names)
     * @param idNumber Government-issued identification number
     * @param nationality Nationality of the document holder
     * @param dateOfBirth Date of birth in string format
     * @param gender Gender of the document holder
     * @param expiryDate Document expiration date in string format
     * @param olderThan Minimum age verification result
     * @param ofac Array of OFAC (Office of Foreign Assets Control) verification results for different modes
     */
    struct GenericDiscloseOutputV2 {
        bytes32 attestationId;
        uint256 userIdentifier;
        uint256 nullifier;
        uint256[4] forbiddenCountriesListPacked;
        string issuingState;
        string[] name;
        string idNumber;
        string nationality;
        string dateOfBirth;
        string gender;
        string expiryDate;
        uint256 olderThan;
        bool[3] ofac;
    }

    /**
     * @dev Verification configuration structure (Version 1)
     * @param olderThanEnabled Whether minimum age verification is enabled
     * @param olderThan Minimum age requirement
     * @param forbiddenCountriesEnabled Whether forbidden countries check is enabled
     * @param forbiddenCountriesListPacked Packed list of forbidden countries (4 uint256 array)
     * @param ofacEnabled Array of boolean flags for different OFAC verification modes
     */
    struct VerificationConfigV1 {
        bool olderThanEnabled;
        uint256 olderThan;
        bool forbiddenCountriesEnabled;
        uint256[4] forbiddenCountriesListPacked;
        bool[3] ofacEnabled;
    }

    /**
     * @dev Verification configuration structure (Version 2)
     * @param olderThanEnabled Whether minimum age verification is enabled
     * @param olderThan Minimum age requirement
     * @param forbiddenCountriesEnabled Whether forbidden countries check is enabled
     * @param forbiddenCountriesListPacked Packed list of forbidden countries (4 uint256 array)
     * @param ofacEnabled Array of boolean flags for different OFAC verification modes
     */
    struct VerificationConfigV2 {
        bool olderThanEnabled;
        uint256 olderThan;
        bool forbiddenCountriesEnabled;
        uint256[4] forbiddenCountriesListPacked;
        bool[3] ofacEnabled;
    }
}


// File npm/@selfxyz/contracts@1.2.0/contracts/interfaces/ISelfVerificationRoot.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title ISelfVerificationRoot
 * @notice Interface for self-verification infrastructure integration
 * @dev Provides base functionality for verifying and disclosing identity credentials
 */
interface ISelfVerificationRoot {
    /**
     * @notice Structure containing proof data for disclose circuits
     * @dev Contains the proof elements required for zero-knowledge verification
     * @param a First proof element
     * @param b Second proof element (2x2 matrix)
     * @param c Third proof element
     * @param pubSignals Array of 21 public signals for the circuit
     */
    struct DiscloseCircuitProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[21] pubSignals;
    }

    /**
     * @notice Structure containing verified identity disclosure output data
     * @dev Contains all disclosed identity information after successful verification
     * @param attestationId Unique identifier for the identity documents
     * @param userIdentifier Unique identifier for the user
     * @param nullifier Unique nullifier to prevent double-spending
     * @param forbiddenCountriesListPacked Packed representation of forbidden countries list
     * @param issuingState The state/country that issued the identity document
     * @param name Array of name components
     * @param idNumber The identity document number
     * @param nationality The nationality of the document holder
     * @param dateOfBirth Date of birth in string format
     * @param gender Gender of the document holder
     * @param expiryDate Expiry date of the identity document
     * @param olderThan Verified age threshold (e.g., 18 for adult verification)
     * @param ofac Array of OFAC (Office of Foreign Assets Control) compliance flags
     */
    struct GenericDiscloseOutputV2 {
        bytes32 attestationId;
        uint256 userIdentifier;
        uint256 nullifier;
        uint256[4] forbiddenCountriesListPacked;
        string issuingState;
        string[] name;
        string idNumber;
        string nationality;
        string dateOfBirth;
        string gender;
        string expiryDate;
        uint256 olderThan;
        bool[3] ofac;
    }

    /**
     * @notice Verifies a self-proof using the bytes-based interface
     * @dev Parses relayer data format and validates against contract settings before calling hub V2
     * @param proofPayload Packed data from relayer in format: | 32 bytes attestationId | proof data |
     * @param userContextData User-defined data in format: | 32 bytes configId | 32 bytes destChainId | 32 bytes userIdentifier | data |
     */
    function verifySelfProof(bytes calldata proofPayload, bytes calldata userContextData) external;

    /**
     * @notice Callback function called upon successful verification
     * @dev Only the identity verification hub V2 contract should call this function
     * @param output The verification output data containing disclosed identity information
     * @param userData The user-defined data passed through the verification process
     */
    function onVerificationSuccess(bytes memory output, bytes memory userData) external;
}

