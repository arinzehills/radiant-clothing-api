const express = require("express");
const router = express.Router();
const ProductCategory = require("../../models/productcategory.model");
const upload = require("../../middleware/multer");
const cloudinary = require("../../config/cloudinary.js");
const fs = require("fs");

uploadImage = upload.single("image");
router.post("/addCategory", async (req, res) => {
  uploadImage(req, res, async function (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({ message: err.message });
    }
    const uploader = async (path) =>
      await cloudinary.uploads(path, "ProductCategories");
    try {
      const file = req.file;
      const { path } = file;
      const newPath = await uploader(path);
      fs.unlinkSync(path);
      const newCategory = new ProductCategory({
        category: req.body.category,
        image: newPath.url,
      });
      await newCategory.save();
      var categories = await ProductCategory.find({}).lean();

      res.status(200).json({
        success: true,
        message: "added in Successfully 🙌 ",
        categories: categories,
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
router.post("/getCategories", async (req, res) => {
  try {
    var categories = await ProductCategory.find({}).lean();

    res.status(200).json({
      success: true,
      message: "fetched Successfully 🙌 ",
      categories: categories,
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
