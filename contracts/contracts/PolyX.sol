// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PolyX - Gasless Twitter-like social contract on Polygon Amoy
/// @notice Stores posts, likes, retweets, and quote tweets. All write functions
/// take a logical user so a relayer can pay gas while the chain still records
/// who acted.
contract PolyX {
    enum PostType {
        Original,
        Retweet,
        Quote
    }

    struct Post {
        uint256 id;
        address author; // logical user
        string content;
        uint256 timestamp;
        PostType postType;
        uint256 referenceId; // original post for retweet/quote
        uint256 likeCount;
        uint256 retweetCount;
        uint256 quoteCount;
    }

    uint256 public nextPostId = 1;
    mapping(uint256 => Post) private posts;
    mapping(uint256 => mapping(address => bool)) private likes;
    mapping(uint256 => mapping(address => bool)) private retweeted;

    event PostCreated(
        uint256 indexed id,
        address indexed author,
        PostType indexed postType,
        uint256 referenceId,
        string content,
        uint256 timestamp
    );

    event Liked(uint256 indexed postId, address indexed user, uint256 timestamp);
    event Retweeted(uint256 indexed postId, uint256 indexed originalId, address indexed user, uint256 timestamp);
    event Quoted(uint256 indexed postId, uint256 indexed originalId, address indexed user, uint256 timestamp, string content);

    error EmptyContent();
    error PostDoesNotExist();
    error AlreadyLiked();
    error AlreadyRetweeted();

    modifier postExists(uint256 postId) {
        if (postId == 0 || postId >= nextPostId) revert PostDoesNotExist();
        _;
    }

    /// @notice Create a new original post
    function createPost(address logicalUser, string calldata content) external returns (uint256) {
        if (bytes(content).length == 0) revert EmptyContent();
        uint256 postId = _writePost(logicalUser, content, PostType.Original, 0);
        emit PostCreated(postId, logicalUser, PostType.Original, 0, content, block.timestamp);
        return postId;
    }

    /// @notice Like a post
    function like(address logicalUser, uint256 postId) external postExists(postId) {
        if (likes[postId][logicalUser]) revert AlreadyLiked();
        likes[postId][logicalUser] = true;
        posts[postId].likeCount += 1;
        emit Liked(postId, logicalUser, block.timestamp);
    }

    /// @notice Retweet an existing post (records a new post of type Retweet)
    function retweet(address logicalUser, uint256 originalId) external postExists(originalId) returns (uint256) {
        if (retweeted[originalId][logicalUser]) revert AlreadyRetweeted();
        retweeted[originalId][logicalUser] = true;
        posts[originalId].retweetCount += 1;
        uint256 postId = _writePost(logicalUser, "", PostType.Retweet, originalId);
        emit Retweeted(postId, originalId, logicalUser, block.timestamp);
        emit PostCreated(postId, logicalUser, PostType.Retweet, originalId, "", block.timestamp);
        return postId;
    }

    /// @notice Quote an existing post with additional text (records a new post of type Quote)
    function quote(address logicalUser, uint256 originalId, string calldata content)
        external
        postExists(originalId)
        returns (uint256)
    {
        if (bytes(content).length == 0) revert EmptyContent();
        posts[originalId].quoteCount += 1;
        uint256 postId = _writePost(logicalUser, content, PostType.Quote, originalId);
        emit Quoted(postId, originalId, logicalUser, block.timestamp, content);
        emit PostCreated(postId, logicalUser, PostType.Quote, originalId, content, block.timestamp);
        return postId;
    }

    function getPost(uint256 postId) external view postExists(postId) returns (Post memory) {
        return posts[postId];
    }

    function batchGetPosts(uint256[] calldata ids) external view returns (Post[] memory) {
        Post[] memory result = new Post[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            if (ids[i] == 0 || ids[i] >= nextPostId) {
                revert PostDoesNotExist();
            }
            result[i] = posts[ids[i]];
        }
        return result;
    }

    function hasLiked(uint256 postId, address user) external view postExists(postId) returns (bool) {
        return likes[postId][user];
    }

    function hasRetweeted(uint256 postId, address user) external view postExists(postId) returns (bool) {
        return retweeted[postId][user];
    }

    function _writePost(address logicalUser, string memory content, PostType postType, uint256 referenceId)
        internal
        returns (uint256)
    {
        uint256 postId = nextPostId++;
        posts[postId] = Post({
            id: postId,
            author: logicalUser,
            content: content,
            timestamp: block.timestamp,
            postType: postType,
            referenceId: referenceId,
            likeCount: 0,
            retweetCount: 0,
            quoteCount: 0
        });
        return postId;
    }
}

