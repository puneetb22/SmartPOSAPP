import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Get stock batches
router.get('/batches', async (req, res) => {
  try {
    const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
    const batches = await storage.getStockBatches(productId);
    res.json(batches);
  } catch (error) {
    console.error('Error fetching stock batches:', error);
    res.status(500).json({ message: 'Failed to fetch stock batches' });
  }
});

// Create new stock batch
router.post('/batches', async (req, res) => {
  try {
    const batch = await storage.createStockBatch(req.body);
    res.json(batch);
  } catch (error) {
    console.error('Error creating stock batch:', error);
    res.status(500).json({ message: 'Failed to create stock batch' });
  }
});

// Get expiring products
router.get('/expiring/:days', async (req, res) => {
  try {
    const days = parseInt(req.params.days);
    const expiringProducts = await storage.getExpiringProducts(days);
    res.json(expiringProducts);
  } catch (error) {
    console.error('Error fetching expiring products:', error);
    res.status(500).json({ message: 'Failed to fetch expiring products' });
  }
});

export { router as stockRouter };