import express from 'express';
import { requireAuth } from '../Middleware/auth.js';
import Organization from '../Models/Organization.js';
import User from '../Models/Users.js';

const router = express.Router();

// Get all organizations for the authenticated user
router.get('/organizations', requireAuth, async (req, res) => {
  try {
    const organizations = await Organization.find({ 
      $or: [
        { owner: req.userId },
        { members: req.userId }
      ]
    }).sort({ createdAt: -1 });

    res.json({ organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Failed to fetch organizations' });
  }
});

// Get a specific organization
router.get('/organizations/:id', requireAuth, async (req, res) => {
  try {
    const organization = await Organization.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.userId },
        { members: req.userId }
      ]
    }).populate('owner', 'username email')
      .populate('members', 'username email');

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({ organization });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ message: 'Failed to fetch organization' });
  }
});

// Create a new organization
router.post('/organizations', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Organization name is required' });
    }

    const organization = await Organization.create({
      name: name.trim(),
      owner: req.userId,
      members: [req.userId],
      isDefault: false
    });

    res.status(201).json({ 
      organization,
      message: 'Organization created successfully' 
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Failed to create organization' });
  }
});

// Rename an organization
router.patch('/organizations/:id', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Organization name is required' });
    }

    const organization = await Organization.findOne({
      _id: req.params.id,
      owner: req.userId // Only owner can rename
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found or you do not have permission' });
    }

    organization.name = name.trim();
    await organization.save();

    res.json({ 
      organization,
      message: 'Organization renamed successfully' 
    });
  } catch (error) {
    console.error('Error renaming organization:', error);
    res.status(500).json({ message: 'Failed to rename organization' });
  }
});

// Delete an organization (only non-default organizations)
router.delete('/organizations/:id', requireAuth, async (req, res) => {
  try {
    const organization = await Organization.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found or you do not have permission' });
    }

    if (organization.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default organization' });
    }

    await organization.deleteOne();

    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ message: 'Failed to delete organization' });
  }
});

// Add member to organization
router.post('/organizations/:id/members', requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    const organization = await Organization.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found or you do not have permission' });
    }

    // Check if user exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    if (organization.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    organization.members.push(userId);
    await organization.save();

    res.json({ 
      organization: await organization.populate('members', 'username email'),
      message: 'Member added successfully' 
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ message: 'Failed to add member' });
  }
});

// Remove member from organization
router.delete('/organizations/:id/members/:userId', requireAuth, async (req, res) => {
  try {
    const organization = await Organization.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found or you do not have permission' });
    }

    // Cannot remove owner
    if (req.params.userId === req.userId) {
      return res.status(400).json({ message: 'Cannot remove the owner from the organization' });
    }

    organization.members = organization.members.filter(
      memberId => memberId.toString() !== req.params.userId
    );
    await organization.save();

    res.json({ 
      organization,
      message: 'Member removed successfully' 
    });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Failed to remove member' });
  }
});

export default router;
