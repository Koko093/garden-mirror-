const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const adminAuth = require('../middleware/adminAuth');

// Get all packages
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ packages });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ message: 'Error fetching packages', error: error.message });
  }
});

// Get package by ID
router.get('/:id', async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json(package);
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({ message: 'Error fetching package', error: error.message });
  }
});

// Create new package (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      duration,
      maxGuests,
      inclusions,
      addOns,
      images,
      isActive = true
    } = req.body;

    const newPackage = new Package({
      name,
      description,
      price,
      duration,
      maxGuests,
      inclusions,
      addOns,
      images,
      isActive
    });

    const savedPackage = await newPackage.save();
    res.status(201).json({
      success: true,
      packageId: savedPackage._id,
      package: savedPackage,
      message: 'Package created successfully'
    });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ message: 'Error creating package', error: error.message });
  }
});

// Update package (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const packageId = req.params.id;
    const updateData = req.body;

    const updatedPackage = await Package.findByIdAndUpdate(
      packageId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json({
      success: true,
      package: updatedPackage,
      message: 'Package updated successfully'
    });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({ message: 'Error updating package', error: error.message });
  }
});

// Delete package (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const packageId = req.params.id;

    // Soft delete - set isActive to false
    const deletedPackage = await Package.findByIdAndUpdate(
      packageId,
      { isActive: false },
      { new: true }
    );

    if (!deletedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({ message: 'Error deleting package', error: error.message });
  }
});

module.exports = router;