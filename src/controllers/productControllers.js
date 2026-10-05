import { prisma } from "../config/db.js";

// GET /products - Fetch all products
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    return res.status(200).json(products);
  } catch (error) {
    console.error("[getProducts] Error:", error.message);
    return res
      .status(500)
      .json({ message: "Error retrieving products", error: error.message });
  }
};

// GET /products/:id - Fetch a single product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid product ID format." });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("[getProductById] Error:", error.message);
    return res
      .status(500)
      .json({ message: "An error occurred while retrieving the product." });
  }
};

// POST /products/restock - Restock/Create single or multiple products
export const restock = async (req, res) => {
  try {
    const products = req.body;

    // Ensuring req.body is actually a non empty array
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        message: "Please provide a non-empty array of products to restock.",
      });
    }

    // Validate essential fields and numbers
    for (const item of products) {
      if (!item.name || item.price === undefined) {
        return res.status(400).json({
          message:
            "Each product in the array must contain a 'name' and a 'price'.",
        });
      }

      if (isNaN(parseFloat(item.price))) {
        return res.status(400).json({
          message: `Invalid price provided for product '${item.name}'.`,
        });
      }
    }

    // Format payload safely for Prisma
    const formattedProducts = products.map((item) => {
      const { name, description, price, stock, images, image } = item;

      return {
        name,
        description: description || null,
        price: parseFloat(price),
        stock: isNaN(parseInt(stock, 10)) ? 0 : parseInt(stock, 10),
        image: Array.isArray(images)
          ? images
          : typeof image === "string" && image.trim() !== ""
            ? [image]
            : [],
      };
    });

    // Bulk insert into database
    const createdProducts = await prisma.product.createManyAndReturn({
      data: formattedProducts,
    });

    return res.status(201).json({
      message: `${createdProducts.length} product(s) added successfully`,
      data: createdProducts,
    });
  } catch (error) {
    console.error("[/products/restock] Error:", error);
    return res.status(500).json({
      message: "Internal server error during product restock",
      error: error.message,
    });
  }
};

// PATCH /products/:id - Update product details
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, images, image } = req.body;

  try {
    const updateData = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;

    // Safe numeric parsing for price
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice)) {
        return res
          .status(400)
          .json({ message: "Price must be a valid number." });
      }
      updateData.price = parsedPrice;
    }

    // Safe numeric parsing for stock
    if (stock !== undefined) {
      const parsedStock = parseInt(stock, 10);
      if (isNaN(parsedStock)) {
        return res
          .status(400)
          .json({ message: "Stock must be a valid integer." });
      }
      updateData.stock = parsedStock;
    }

    // Handle images array / string safely
    if (images !== undefined || image !== undefined) {
      if (Array.isArray(images)) {
        updateData.images = images;
      } else if (typeof images === "string" && images.trim() !== "") {
        updateData.images = [images];
      } else if (typeof image === "string" && image.trim() !== "") {
        updateData.images = [image];
      } else {
        updateData.images = [];
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("[updateProduct] Error:", error.message);

    // Prisma error code P2025: Record to update not found
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Product not found." });
    }

    return res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

// DELETE /products/:id - Delete product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({ where: { id } });
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("[deleteProduct] Error:", error.message);

    // Prisma error code P2025: Record to delete not found
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Product not found." });
    }

    return res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};
