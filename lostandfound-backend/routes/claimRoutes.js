const express = require('express');
const router = express.Router();
const ClaimRequest = require('../models/claimRequest');
const Item = require('../models/Item');
const { requireAuth, requireAdmin } = require('../middleware/auth'); 

// POST /api/claims - logged-in user submits a claim
router.post('/', requireAuth, async (req, res) => {
  try {
    const { itemId, message } = req.body;

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const claim = await ClaimRequest.create({
      item: itemId,
      requester: req.user.id, // pulled from JWT, not the body
      message
    });

    res.status(201).json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/claims/mine - logged-in user views their own claims
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const claims = await ClaimRequest.find({ requester: req.user.id })
      .populate('item');
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/claims - admin views all pending claims
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const claims = await ClaimRequest.find({ status: 'pending' })
      .populate('item')
      .populate('requester', 'email role'); // exclude password
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/claims/:id - admin approves or rejects a claim
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const claim = await ClaimRequest.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    claim.status = status;
    await claim.save();

    if (status === 'approved') {
      await Item.findByIdAndUpdate(claim.item, { status: 'claimed' });
    }

    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/claims/:id/approve
router.patch('/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const claim = await ClaimRequest.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    claim.status = 'approved';
    await claim.save();

    await Item.findByIdAndUpdate(claim.item, { status: 'claimed' });

    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/claims/:id/reject
router.patch('/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const claim = await ClaimRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/claims/:id - admin deletes a claim
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const claim = await ClaimRequest.findByIdAndDelete(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    res.json({ message: 'Claim deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;