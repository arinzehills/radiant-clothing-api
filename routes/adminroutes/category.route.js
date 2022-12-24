const express = require("express");
const router = express.Router();
const ProductCategory = require("../../models/productcategory.model");
const upload = require("../../middleware/multer");
const cloudinary = require("../../config/cloudinary.js");
const cloudinaryv2 = require("cloudinary");

const fs = require("fs");
const auth = require("../../middleware/auth");

uploadImage = upload.single("image");
router.post("/addCategory", async (req, res) => {
  uploadImage(req, res, async function (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({ message: err.message });
    }
    const { category } = req.body;

    // const catExist = await ProductCategory.findOne({ category });

    // if (catExist) {
    //   return res.status(409).json({
    //     success: false,
    //     message: "Category Already Exist.",
    //   });
    // }

    const uploader = async (path) =>
      await cloudinary.uploads(path, "ProductCategories");
    try {
      const file = req.files[0];

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
router.post("/deleteCategory", async (req, res) => {
  try {
    var category = await ProductCategory.findByIdAndDelete(req.query.id);
    const url = category.image;
    const url2 = url.split("/").pop();
    const filename = url2.substring(0, url2.lastIndexOf("."));
    console.log(filename);
    cloudinaryv2.v2.uploader.destroy(
      "ProductCategories/" + filename,
      { resource_type: "image", type: "upload" },
      function (error, result) {
        console.log("result:", result);
        console.log("error:", error);
      }
    );
    res.status(200).json({
      success: true,
      message: "deleted Successfully 🙌 ",
      category: category,
    });
  } catch (err) {
    console.log(err);
    res.status(200).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
