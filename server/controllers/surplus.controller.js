const SurplusPost = require('../models/SurplusPost');

// GET /api/surplus  — public board (no auth needed to view)
exports.getPosts = async (req, res, next) => {
  try {
    const { status = 'available', cafeteriaId } = req.query;
    const filter = { status };
    if (cafeteriaId) filter.cafeteriaId = cafeteriaId;

    const posts = await SurplusPost.find(filter)
      .sort({ expiryTime: 1 })   // soonest-to-expire first
      .populate('postedBy',  'name')
      .populate('claimedBy', 'name')
      .lean();

    res.json({ posts });
  } catch (err) {
    next(err);
  }
};

// POST /api/surplus  — staff creates a surplus post
exports.createPost = async (req, res, next) => {
  try {
    const { items, preparedTime, expiryTime, mealLogId } = req.body;

    if (!items?.length) return res.status(400).json({ error: 'items array is required' });

    const post = await SurplusPost.create({
      cafeteriaId: req.user.cafeteriaId,
      mealLogId:   mealLogId || null,
      items,
      preparedTime: new Date(preparedTime),
      expiryTime:   new Date(expiryTime),
      postedBy:     req.user.userId,
    });

    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/surplus/:id/claim  — partner claims a post
exports.claimPost = async (req, res, next) => {
  try {
    const post = await SurplusPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.status !== 'available') {
      return res.status(409).json({ error: `Post is already ${post.status}` });
    }
    if (new Date(post.expiryTime) < new Date()) {
      post.status = 'expired';
      await post.save();
      return res.status(410).json({ error: 'Post has expired' });
    }

    post.status    = 'claimed';
    post.claimedBy = req.user.userId;
    post.claimedAt = new Date();
    await post.save();

    res.json({ post });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/surplus/:id/confirm  — partner confirms pickup
exports.confirmPickup = async (req, res, next) => {
  try {
    const post = await SurplusPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.status !== 'claimed') {
      return res.status(409).json({ error: 'Post must be claimed before confirming pickup' });
    }
    // Only the partner who claimed it can confirm
    if (String(post.claimedBy) !== String(req.user.userId)) {
      return res.status(403).json({ error: 'Only the claiming partner can confirm pickup' });
    }

    post.status      = 'picked_up';
    post.completedAt = new Date();
    await post.save();

    res.json({ post });
  } catch (err) {
    next(err);
  }
};
