import Category from '../models/Category.js';
import Auction from '../models/Auction.js';

export const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  
  // Attach auction counts for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const count = await Auction.countDocuments({ category: cat._id });
      return {
        ...cat.toObject(),
        auctionCount: count,
      };
    })
  );

  res.json(categoriesWithCounts);
};

export const createCategory = async (req, res) => {
  const { name, description, image } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (exists) {
    return res.status(400).json({ message: 'Category with this name already exists' });
  }

  const category = await Category.create({
    name,
    description: description || '',
    image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  });

  res.status(201).json(category);
};

export const updateCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  category.name = req.body.name || category.name;
  category.description = req.body.description !== undefined ? req.body.description : category.description;
  category.image = req.body.image || category.image;

  const updatedCategory = await category.save();
  res.json(updatedCategory);
};

export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  // Check if any auctions are using this category
  const inUse = await Auction.countDocuments({ category: req.params.id });
  if (inUse > 0) {
    return res.status(400).json({
      message: `Cannot delete category: ${inUse} auction(s) are currently associated with it`,
    });
  }

  await category.deleteOne();
  res.json({ message: 'Category removed successfully' });
};
