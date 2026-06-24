import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Submit a KYC verification document
 */
export const submitVerification = mutation({
  args: {
    verificationType: v.union(
      v.literal("id_document"),
      v.literal("proof_of_address"),
      v.literal("analyst_certification"),
      v.literal("accredited_investor")
    ),
    documentUrl: v.string(),
  },
  async handler(ctx, args) {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    // Create verification record
    const verificationId = await ctx.db.insert("userVerifications", {
      userId,
      verificationType: args.verificationType,
      status: "pending",
      documentUrl: args.documentUrl,
      submittedAt: Date.now(),
      supabaseId: userId,
    });

    // Update user KYC status
    const user = await ctx.db
      .query("users")
      .withIndex("by_supabase_id", (q) => q.eq("supabaseUserId", userId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        kycStatus: "pending",
        updatedAt: Date.now(),
      });
    }

    return { verificationId };
  },
});

/**
 * Get user's verification documents
 */
export const getUserVerifications = query({
  args: {},
  async handler(ctx) {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const verifications = await ctx.db
      .query("userVerifications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return verifications.map((v) => ({
      id: v._id,
      type: v.verificationType,
      status: v.status,
      submittedAt: new Date(v.submittedAt).toISOString(),
      reviewedAt: v.reviewedAt ? new Date(v.reviewedAt).toISOString() : undefined,
      reviewNotes: v.reviewNotes,
      documentUrl: v.documentUrl,
    }));
  },
});

/**
 * Get user's KYC status
 */
export const getKycStatus = query({
  args: {},
  async handler(ctx) {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) {
      return { status: "none", progress: 0 };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_supabase_id", (q) => q.eq("supabaseUserId", identity.subject))
      .first();

    if (!user) {
      return { status: "none", progress: 0 };
    }

    const verifications = await ctx.db
      .query("userVerifications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const approved = verifications.filter((v) => v.status === "approved").length;
    const total = verifications.length;
    const progress = total > 0 ? (approved / total) * 100 : 0;

    return {
      status: user.kycStatus || "none",
      progress,
      total,
      approved,
    };
  },
});