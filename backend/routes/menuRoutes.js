const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// GET /api/menu          → all menu items
// GET /api/menu/categories → all categories
// GET /api/menu/category/:categoryId → items in a category

router.get('/', menuController.getAllMenuItems);
router.get('/categories', menuController.getAllCategories);
router.get('/category/:categoryId', menuController.getMenuByCategory);

module.exports = router;