import db from '../models/index.js';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

// để xoá ảnh cũ nếu có update ảnh mới
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../public/images");

const uploadToCloudinary = (fileBuffer, folder = "MINMIU-PETSTORE/products") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        Readable.from(fileBuffer).pipe(uploadStream);
    });
};

const getPublicIdFromCloudinaryUrl = (url) => {
    if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) {
        return null;
    }

    try {
        const parsed = new URL(url);
        const parts = parsed.pathname.split("/");
        const uploadIndex = parts.indexOf("upload");
        if (uploadIndex === -1) return null;

        const publicPath = parts.slice(uploadIndex + 1).join("/");
        const withoutVersion = publicPath.replace(/^v\d+\//, "");
        return withoutVersion.replace(/\.[^.]+$/, "");
    } catch (error) {
        return null;
    }
};

const createProductController = async (req, res) => {
    try {
        const { name, quantity, price, status, categoryId, description } = req.body;
        
        console.log("Create Product Request Body:", req.body);
        console.log("Create Product Request File:", req.file);

        if (!name || !quantity || !price || !categoryId) {
            return res.status(400).json({
                EC: -1,
                EM: "Missing required fields",
                DT: "",
            });
        }

        let image = null;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            image = result.secure_url;
        }

        const newProduct = await db.Product.create({
            name,
            quantity: parseInt(quantity, 10),
            price: parseInt(price, 10),
            status: status || "Active",
            categoryId: parseInt(categoryId, 10),
            description: description || "",
            image,
        });

        return res.status(201).json({
            EC: 0,
            EM: "Product created successfully",
            DT: newProduct,
        });
    } catch (error) {
        console.error("Error creating product:", error);
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                EC: -1,
                EM: "Invalid Category ID. The selected category does not exist.",
                DT: "",
            });
        }
        return res.status(500).json({
            EC: -1,
            EM: "Error from server",
            DT: error.message,
        });
    }
};

const getAllProductsController = async (req, res) => {
    try {
        const products = await db.Product.findAll({
            include: [{ model: db.Category, as: 'category', attributes: ['name'] }],
            order: [['createdAt', 'DESC']],
        });
        return res.status(200).json({
            EC: 0,
            EM: "Get all products successfully",
            DT: products,
        });
    } catch (error) {
        console.error("Error getting products:", error);
        return res.status(500).json({
            EC: -1,
            EM: "Error from backend",
            DT: error.message,
        });
    }
};

const getProductByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await db.Product.findByPk(id, {
            include: [{ model: db.Category, as: 'category', attributes: ['name'] }]
        });
        if (!product) {
            return res.status(404).json({ EC: -1, EM: "Product not found", DT: "" });
        }
        return res.status(200).json({ EC: 0, EM: "Get product successfully", DT: product });
    } catch (error) {
        console.error("Error getting product:", error);
        return res.status(500).json({ EC: -1, EM: "Error from server", DT: error.message });
    }
};

const createCategoryController = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ EC: -1, EM: "Category name is required", DT: "" });
        }
        const existingCategory = await db.Category.findOne({ where: { name } });
        if (existingCategory) {
            return res.status(400).json({ EC: -1, EM: "Category already exists", DT: "" });
        }
        const newCategory = await db.Category.create({ name });
        return res.status(201).json({ EC: 0, EM: "Category created successfully", DT: newCategory });
    } catch (error) {
        console.error("Error creating category:", error);
        return res.status(500).json({ EC: -1, EM: "Error from backend", DT: error.message });
    }
};

const getAllCategoriesController = async (req, res) => {
    try {
        const categories = await db.Category.findAll();
        return res.status(200).json({ EC: 0, EM: "Get all categories successfully", DT: categories });
    } catch (error) {
        console.error("Error getting categories:", error);
        return res.status(500).json({ EC: -1, EM: "Error from backend", DT: error.message });
    }
};

const updateCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ EC: -1, EM: "Category name is required", DT: "" });
        }
        const category = await db.Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ EC: -1, EM: "Category not found", DT: "" });
        }
        await category.update({ name });
        return res.status(200).json({ EC: 0, EM: "Category updated successfully", DT: category });
    } catch (error) {
        console.error("Error updating category:", error);
        return res.status(500).json({ EC: -1, EM: "Error from backend", DT: error.message });
    }
};

const deleteCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await db.Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ EC: -1, EM: "Category not found", DT: "" });
        }
        await category.destroy();
        return res.status(200).json({ EC: 0, EM: "Category deleted successfully", DT: "" });
    } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({ EC: -1, EM: "Error from backend", DT: error.message });
    }
};

const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, price, status, categoryId, description } = req.body;

    const product = await db.Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ EC: -1, EM: "Product not found", DT: "" });
    }

        // nếu có upload ảnh mới -> upload Cloudinary và xoá ảnh cũ trên Cloudinary
        let newImage = product.image;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            newImage = result.secure_url;

            const oldPublicId = getPublicIdFromCloudinaryUrl(product.image);
            if (oldPublicId) {
                await cloudinary.uploader.destroy(oldPublicId, { resource_type: "image" }).catch(() => {});
            }
        }

    await product.update({
      name: name ?? product.name,
      quantity: quantity !== undefined ? parseInt(quantity, 10) : product.quantity,
      price: price !== undefined ? parseInt(price, 10) : product.price,
      status: status ?? product.status,
      categoryId: categoryId !== undefined ? parseInt(categoryId, 10) : product.categoryId,
      description: description ?? product.description,
      image: newImage,
    });

    return res.status(200).json({
      EC: 0,
      EM: "Product updated successfully",
      DT: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Error from server",
      DT: error.message,
    });
  }
};

const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db.Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ EC: -1, EM: "Product not found", DT: "" });
    }

        // xoá ảnh Cloudinary nếu có
        const publicId = getPublicIdFromCloudinaryUrl(product.image);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId, { resource_type: "image" }).catch(() => {});
        }

    await product.destroy();

    return res.status(200).json({
      EC: 0,
      EM: "Product deleted successfully",
      DT: "",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Error from server",
      DT: error.message,
    });
  }
};

export {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  createCategoryController,
  getAllCategoriesController,
  updateCategoryController,
  deleteCategoryController,
};