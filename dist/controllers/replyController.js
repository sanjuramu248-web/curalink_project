"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRepliesByPost = exports.getReplyById = exports.updateReply = exports.createReply = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const prisma_1 = require("../lib/prisma");
const reply_1 = require("../validation/reply");
exports.createReply = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validatedData = reply_1.createReplySchema.parse(req.body);
    // Check if user is a researcher (only researchers can reply)
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: 'temp-user-id' }, // Placeholder for now
    });
    if (!user || user.role !== 'RESEARCHER') {
        throw new apiError_1.ApiError(403, 'Only researchers can reply to posts');
    }
    const reply = await prisma_1.prisma.reply.create({
        data: {
            ...validatedData,
            authorId: 'temp-user-id', // Placeholder for now
        },
        include: {
            author: true,
            post: true,
        },
    });
    res.status(201).json(new apiResponse_1.ApiResponse(201, reply, 'Reply created successfully'));
});
exports.updateReply = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const validatedId = reply_1.replyIdSchema.parse({ id });
    const validatedData = reply_1.updateReplySchema.parse(req.body);
    const reply = await prisma_1.prisma.reply.update({
        where: { id: validatedId.id },
        data: validatedData,
        include: {
            author: true,
            post: true,
        },
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, reply, 'Reply updated successfully'));
});
exports.getReplyById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const validatedId = reply_1.replyIdSchema.parse({ id });
    const reply = await prisma_1.prisma.reply.findUnique({
        where: { id: validatedId.id },
        include: {
            author: true,
            post: true,
        },
    });
    if (!reply) {
        throw new apiError_1.ApiError(404, 'Reply not found');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, reply, 'Reply retrieved successfully'));
});
exports.listRepliesByPost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { postId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    const replies = await prisma_1.prisma.reply.findMany({
        where: { postId },
        include: {
            author: true,
            post: true,
        },
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'asc' },
    });
    const total = await prisma_1.prisma.reply.count({ where: { postId } });
    res.status(200).json(new apiResponse_1.ApiResponse(200, { replies, total, limit, offset }, 'Replies retrieved successfully'));
});
//# sourceMappingURL=replyController.js.map