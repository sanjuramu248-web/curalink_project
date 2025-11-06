"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectMeetingRequest = exports.acceptMeetingRequest = exports.listUserMeetingRequests = exports.getMeetingRequestById = exports.updateMeetingRequest = exports.createMeetingRequest = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const prisma_1 = require("../lib/prisma");
const meetingRequest_1 = require("../validation/meetingRequest");
exports.createMeetingRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validatedData = meetingRequest_1.createMeetingRequestSchema.parse(req.body);
    const recipient = await prisma_1.prisma.user.findUnique({
        where: { id: validatedData.recipientId },
        include: { researcher: true },
    });
    if (!recipient || recipient.role !== 'RESEARCHER') {
        throw new apiError_1.ApiError(400, 'Meeting requests can only be sent to researchers');
    }
    if (!recipient.researcher?.availability) {
        throw new apiError_1.ApiError(400, 'Researcher is not available for meetings');
    }
    const meetingRequest = await prisma_1.prisma.meetingRequest.create({
        data: {
            senderId: req.user?.id || '', // Assuming auth middleware sets req.user
            ...validatedData,
        },
        include: {
            sender: true,
            recipient: true,
        },
    });
    res.status(201).json(new apiResponse_1.ApiResponse(201, meetingRequest, 'Meeting request created successfully'));
});
exports.updateMeetingRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const validatedId = meetingRequest_1.meetingRequestIdSchema.parse({ id });
    const validatedData = meetingRequest_1.updateMeetingRequestSchema.parse(req.body);
    const meetingRequest = await prisma_1.prisma.meetingRequest.update({
        where: { id: validatedId.id },
        data: validatedData,
        include: {
            sender: true,
            recipient: true,
        },
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, meetingRequest, 'Meeting request updated successfully'));
});
exports.getMeetingRequestById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const validatedId = meetingRequest_1.meetingRequestIdSchema.parse({ id });
    const meetingRequest = await prisma_1.prisma.meetingRequest.findUnique({
        where: { id: validatedId.id },
        include: {
            sender: true,
            recipient: true,
        },
    });
    if (!meetingRequest) {
        throw new apiError_1.ApiError(404, 'Meeting request not found');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, meetingRequest, 'Meeting request retrieved successfully'));
});
exports.listUserMeetingRequests = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const { status, limit = 20, offset = 0 } = req.query;
    const where = {
        OR: [
            { senderId: userId },
            { recipientId: userId },
        ],
    };
    if (status) {
        where.status = status;
    }
    const meetingRequests = await prisma_1.prisma.meetingRequest.findMany({
        where,
        include: {
            sender: true,
            recipient: true,
        },
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
    });
    const total = await prisma_1.prisma.meetingRequest.count({ where });
    res.status(200).json(new apiResponse_1.ApiResponse(200, { meetingRequests, total, limit, offset }, 'Meeting requests retrieved successfully'));
});
exports.acceptMeetingRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const validatedId = meetingRequest_1.meetingRequestIdSchema.parse({ id });
    const meetingRequest = await prisma_1.prisma.meetingRequest.update({
        where: { id: validatedId.id },
        data: { status: 'ACCEPTED' },
        include: {
            sender: true,
            recipient: true,
        },
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, meetingRequest, 'Meeting request accepted'));
});
exports.rejectMeetingRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const validatedId = meetingRequest_1.meetingRequestIdSchema.parse({ id });
    const meetingRequest = await prisma_1.prisma.meetingRequest.update({
        where: { id: validatedId.id },
        data: { status: 'REJECTED' },
        include: {
            sender: true,
            recipient: true,
        },
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, meetingRequest, 'Meeting request rejected'));
});
//# sourceMappingURL=meetingRequestController.js.map