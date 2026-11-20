const express = require('express');
const mongoose = require('mongoose');
const Design = require('../models/Design');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// SAVE DESIGN
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const {
      designName,
      originalImage,
      paintedImage,
      selectedColor
    } = req.body;

    if (!originalImage || !paintedImage || !selectedColor) {
      return res.status(400).json({
        message: 'All design details are required'
      });
    }

    const design = new Design({
      user: req.userId,
      designName: designName || 'My Wall Design',
      originalImage,
      paintedImage,
      selectedColor
    });

    await design.save();

    res.status(201).json({
      message: 'Design saved successfully',
      design
    });

  } catch (error) {
    console.error('Save Design Error:', error);
    res.status(500).json({
      message: 'Unable to save design'
    });
  }
});


// GET MY DESIGNS WITH SEARCH AND FILTER
router.get('/my-designs', authMiddleware, async (req, res) => {
  try {
    const { search, color, favorite } = req.query;

    const filter = {
      user: req.userId
    };

    if (search) {
      filter.designName = {
        $regex: search,
        $options: 'i'
      };
    }

    if (color) {
      filter.selectedColor = color;
    }

    if (favorite === 'true') {
      filter.isFavorite = true;
    }

    const designs = await Design.find(filter)
      .sort({ createdAt: -1 });

    res.json(designs);

  } catch (error) {
    console.error('Fetch Designs Error:', error);
    res.status(500).json({
      message: 'Unable to fetch designs'
    });
  }
});


// DELETE DESIGN
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid design ID'
      });
    }

    const design = await Design.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!design) {
      return res.status(404).json({
        message: 'Design not found'
      });
    }

    res.json({
      message: 'Design deleted successfully'
    });

  } catch (error) {
    console.error('Delete Design Error:', error);
    res.status(500).json({
      message: 'Unable to delete design'
    });
  }
});


// RENAME DESIGN
router.patch('/:id/rename', authMiddleware, async (req, res) => {
  try {
    const { designName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid design ID'
      });
    }

    if (typeof designName !== 'string' || !designName.trim()) {
      return res.status(400).json({
        message: 'Design name is required'
      });
    }

    const design = await Design.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId
      },
      {
        designName: designName.trim()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!design) {
      return res.status(404).json({
        message: 'Design not found'
      });
    }

    res.json({
      message: 'Design renamed successfully',
      design
    });

  } catch (error) {
    console.error('Rename Design Error:', error);
    res.status(500).json({
      message: 'Unable to rename design'
    });
  }
});


// ADD OR REMOVE FAVORITE
router.patch('/:id/favorite', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid design ID'
      });
    }

    const { isFavorite } = req.body;

    if (typeof isFavorite !== 'boolean') {
      return res.status(400).json({
        message: 'Favorite status must be true or false'
      });
    }

    const design = await Design.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId
      },
      {
        isFavorite
      },
      {
        new: true
      }
    );

    if (!design) {
      return res.status(404).json({
        message: 'Design not found'
      });
    }

    res.json({
      message: isFavorite
        ? 'Added to favorites'
        : 'Removed from favorites',
      design
    });

  } catch (error) {
    console.error('Favorite Error:', error);
    res.status(500).json({
      message: 'Unable to update favorite'
    });
  }
});


// VIEW SINGLE DESIGN
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid design ID'
      });
    }

    const design = await Design.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!design) {
      return res.status(404).json({
        message: 'Design not found'
      });
    }

    res.json(design);

  } catch (error) {
    console.error('View Design Error:', error);
    res.status(500).json({
      message: 'Unable to fetch design'
    });
  }
});

module.exports = router;
