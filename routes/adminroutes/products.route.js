const express = require("express");
const router = express.Router();
const Product = require("../../models/product.model");
const upload = require("../../middleware/multer");
const cloudinary = require("../../config/cloudinary.js");
const fs = require("fs");

uploadProductImage = upload.array("image");

router.post("/addProduct", async (req, res) => {
  uploadProductImage(req, res, async function (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({ message: err.message });
    }
    const uploader = async (path) => await cloudinary.uploads(path, "Products");
    try {
      const urls = [];
      const files = req.files;
      for (const file of files) {
        const path = await file.path;
        const newPath = await uploader(path);
        console.log(newPath);
        fs.unlinkSync(path);
        urls.push(newPath.url);
      }

      console.log(urls);
      console.log(files);

      const newProduct = new Product({
        ...req.body,
        category: req.body.category,
        images: urls,
      });
      await newProduct.save();
      var products = await Product.find({}).lean();

      res.status(200).json({
        success: true,
        message: "added in Successfully 🙌",
        products: products,
      });
    } catch (err) {
      console.log(err);
      res.status(200).json({
        success: false,
        message: err.message,
      });
    }
  });

  // Our register logic ends here
});
router.post("/getProducts", async (req, res) => {
  try {
    var products = await Product.find({}).lean();

    res.status(200).json({
      success: true,
      message: "fetched Successfully 🙌 ",
      products: products,
    });
  } catch (err) {
    console.log(err);
    res.status(200).json({
      success: false,
      message: err.message,
    });
  }
  // Our register logic ends here
});
module.exports = router;
