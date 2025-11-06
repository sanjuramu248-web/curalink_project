"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAllPosts = exports.listPostsByCommunity = exports.getPostById = exports.updatePost = exports.createPost = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const prisma_1 = require("../lib/prisma");
const post_1 = require("../validation/post");
exports.createPost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validatedData = post_1.createPostSchema.parse(req.body);
    // For MVP, allow any authenticated user to create posts
    // TODO: Add authentication middleware to set req.user
    const authorId = 'temp-user-id'; // Placeholder for now
    const post = await prisma_1.prisma.post.create({
        data: {
            ...validatedData,
            authorId,
        },
        include: {
            author: true,
            community: true,
        },
    });
    res.status(201).json(new apiResponse_1.ApiResponse(201, post, 'Post created successfully'));
});
exports.updatePost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const validatedId = post_1.postIdSchema.parse({ id });
    const validatedData = post_1.updatePostSchema.parse(req.body);
    const post = await prisma_1.prisma.post.update({
        where: { id: validatedId.id },
        data: validatedData,
        include: {
            author: true,
            community: true,
        },
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, post, 'Post updated successfully'));
});
exports.getPostById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const validatedId = post_1.postIdSchema.parse({ id });
    const post = await prisma_1.prisma.post.findUnique({
        where: { id: validatedId.id },
        include: {
            author: true,
            community: true,
            replies: {
                include: {
                    author: true,
                },
                orderBy: { createdAt: 'asc' },
            },
        },
    });
    if (!post) {
        throw new apiError_1.ApiError(404, 'Post not found');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, post, 'Post retrieved successfully'));
});
exports.listPostsByCommunity = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { communitySlug } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    const posts = await prisma_1.prisma.post.findMany({
        where: {
            community: {
                slug: communitySlug,
            },
        },
        include: {
            author: true,
            community: true,
            replies: {
                include: {
                    author: true,
                },
            },
        },
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
    });
    const total = await prisma_1.prisma.post.count({
        where: {
            community: {
                slug: communitySlug,
            },
        },
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, { posts, total, limit, offset }, 'Posts retrieved successfully'));
});
exports.listAllPosts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { limit = 20, offset = 0 } = req.query;
    const posts = await prisma_1.prisma.post.findMany({
        include: {
            author: true,
            community: true,
            replies: {
                include: {
                    author: true,
                },
            },
        },
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
    });
    const total = await prisma_1.prisma.post.count();
    res.status(200).json(new apiResponse_1.ApiResponse(200, { posts, total, limit, offset }, 'Posts retrieved successfully'));
});
//# sourceMappingURL=postController.js.map