"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importPublications = exports.getResearcherProfile = exports.updateResearcherProfile = exports.createResearcherProfile = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const prisma_1 = require("../lib/prisma");
const researcherProfile_1 = require("../validation/researcherProfile");
exports.createResearcherProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validatedData = researcherProfile_1.createResearcherProfileSchema.parse(req.body);
    const existingProfile = await prisma_1.prisma.researcherProfile.findUnique({
        where: { userId: validatedData.userId },
    });
    if (existingProfile) {
        throw new apiError_1.ApiError(400, 'Researcher profile already exists for this user');
    }
    const profile = await prisma_1.prisma.researcherProfile.create({
        data: validatedData,
    });
    res.status(201).json(new apiResponse_1.ApiResponse(201, profile, 'Researcher profile created successfully'));
});
exports.updateResearcherProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const validatedData = researcherProfile_1.updateResearcherProfileSchema.parse(req.body);
    const profile = await prisma_1.prisma.researcherProfile.update({
        where: { userId },
        data: validatedData,
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, profile, 'Researcher profile updated successfully'));
});
exports.getResearcherProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const profile = await prisma_1.prisma.researcherProfile.findUnique({
        where: { userId },
        include: {
            publications: true,
            trials: true,
        },
    });
    if (!profile) {
        throw new apiError_1.ApiError(404, 'Researcher profile not found');
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, profile, 'Researcher profile retrieved successfully'));
});
exports.importPublications = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const { orcid, researchgate } = req.body;
    const profile = await prisma_1.prisma.researcherProfile.findUnique({
        where: { userId },
    });
    if (!profile) {
        throw new apiError_1.ApiError(404, 'Researcher profile not found');
    }
    // TODO: Implement actual API calls to ORCID/ResearchGate
    // For now, just update the profile with the provided IDs
    const updatedProfile = await prisma_1.prisma.researcherProfile.update({
        where: { userId },
        data: {
            orcid,
            researchgate,
            meta: {
                ...(profile.meta || {}),
                importStatus: 'pending',
            },
        },
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, updatedProfile, 'Publication import initiated'));
});
//# sourceMappingURL=researcherProfileController.js.map