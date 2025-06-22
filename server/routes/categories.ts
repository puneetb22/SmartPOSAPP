import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Get all categories
router.get('/', async (_req, res) => {
  try {
    const categories = await storage.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const category = await storage.createCategory(req.body);
    res.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
});

export { router as categoriesRouter };