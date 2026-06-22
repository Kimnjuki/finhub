import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listComments = query({
  args: {},
  handler: async (ctx: any) => {
    return ctx.db.query("comments").withIndex("by_created").order("desc").collect();
  },
});

export const getCommentById = query({
  args: { id: v.id("comments") },
  handler: async (ctx: any, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("comment not found: " + id);
    return doc;
  },
});

export const getCommentsByParent = query({
  args: { parentType: v.union(v.literal("idea"),v.literal("signal"),v.literal("news"),v.literal("article"),v.literal("watchlist")), parentEntityId: v.string() },
  handler: async (ctx, { parentType, parentEntityId }) => {
    return ctx.db.query("comments").withIndex("by_parent", (q) => q.eq("parentType", parentType).eq("parentEntityId", parentEntityId)).order("desc").collect();
  },
});

export const getCommentsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return ctx.db.query("comments").withIndex("by_user", (q) => q.eq("userId", userId)).order("desc").collect();
  },
});

export const createComment = mutation({
  args: { parentId: v.optional(v.id("comments")), parentType: v.union(v.literal("idea"),v.literal("signal"),v.literal("news"),v.literal("article"),v.literal("watchlist")), parentEntityId: v.string(), userId: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const cid = await ctx.db.insert("comments", { parentId: args.parentId??undefined, parentType: args.parentType, parentEntityId: args.parentEntityId, userId: args.userId, body: args.body, likesCount: 0, repliesCount: 0, isPinned: false, isEdited: false, status: "active", createdAt: now, updatedAt: now });
    if (args.parentId) { const p = await ctx.db.get(args.parentId); if(p) await ctx.db.patch(args.parentId, { repliesCount: (p.repliesCount??0)+1 }); }
    return cid;
  },
});

export const updateComment = mutation({
  args: { id: v.id("comments"), body: v.optional(v.string()), isPinned: v.optional(v.boolean()), status: v.optional(v.union(v.literal("active"),v.literal("hidden"),v.literal("removed"))) },
  handler: async (ctx, { id, ...fields }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("comment not found: " + id);
    const patch = Object.fromEntries(Object.entries(fields).filter(([k,v]) => v!==undefined));
    patch.updatedAt = Date.now();
    patch.isEdited = fields.body !== undefined ? true : doc.isEdited;
    return ctx.db.patch(id, patch);
  },
});

export const removeComment = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("comment not found: " + id);
    await ctx.db.patch(id, { status: "removed", updatedAt: Date.now() });
  },
});

export const listCommentLikes = query({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    return ctx.db.query("commentLikes").withIndex("by_comment", (q) => q.eq("commentId", commentId)).collect();
  },
});

export const getCommentLike = query({
  args: { commentId: v.id("comments"), userId: v.string() },
  handler: async (ctx, { commentId, userId }) => {
    return ctx.db.query("commentLikes").withIndex("by_comment_user", (q) => q.eq("commentId", commentId).eq("userId", userId)).first();
  },
});

export const toggleCommentLike = mutation({
  args: { commentId: v.id("comments"), userId: v.string() },
  handler: async (ctx, { commentId, userId }) => {
    const existing = await ctx.db.query("commentLikes").withIndex("by_comment_user", (q) => q.eq("commentId", commentId).eq("userId", userId)).first();
    const comment = await ctx.db.get(commentId);
    if (!comment) throw new Error("comment not found: " + commentId);
    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(commentId, { likesCount: Math.max((comment.likesCount??0)-1,0) });
      return { liked: false };
    } else {
      await ctx.db.insert("commentLikes", { commentId, userId, createdAt: Date.now() });
      await ctx.db.patch(commentId, { likesCount: (comment.likesCount??0)+1 });
      return { liked: true };
    }
  },
});

export const removeCommentLike = mutation({
  args: { id: v.id("commentLikes") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("commentLike not found: " + id);
    await ctx.db.delete(id);
  },
});
