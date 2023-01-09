const express = require("express");
const router = express.Router();
const Product = require("../../models/product.model");
const upload = require("../../middleware/multer");
const cloudinary = require("../../config/cloudinary.js");
const fs = require("fs");
const cloudinaryv2 = require("cloudinary");

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

      //   console.log(urls);
      //   console.log(files);

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
router.post("/editProduct", async (req, res) => {
  uploadProductImage(req, res, async function (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({ message: err.message });
    }
    const uploader = async (path) => await cloudinary.uploads(path, "Products");
    try {
      const urls = [];
      const files = req.files;
      console.log(req.files);
      var product = await Product.findById(req.body.product_id).lean();
      if (req.files.length !== 0) {
        for (const image of product.images) {
          console.log(image);
          const url = image;
          const url2 = url.split("/").pop();
          const filename = url2.substring(0, url2.lastIndexOf("."));
          console.log(filename);
          cloudinaryv2.v2.uploader.destroy(
            "Products/" + filename,
            { resource_type: "image", type: "upload" },
            function (error, result) {
              console.log("result:", result);
              console.log("error:", error);
            }
          );
        }
      }

      for (const file of files) {
        const path = await file.path;
        const newPath = await uploader(path);
        console.log(newPath);
        fs.unlinkSync(path);
        urls.push(newPath.url);
      }

      if (req.files.length !== 0) {
        console.log("User selected some files");
        const oldProduct = await Product.findByIdAndUpdate(
          req.body.product_id,
          {
            ...req.body,
            images: urls,
          },
          { useFindAndModify: false }
        ).lean();
        console.log(oldProduct);

        res.status(200).json({
          success: true,
          message: "added in Successfully 🙌",
          product: oldProduct,
        });
      } else {
        console.log("not files has run");
        const oldProduct = await Product.findByIdAndUpdate(
          req.body.product_id,
          {
            ...req.body,
          },
          { useFindAndModify: false }
        ).lean();

        console.log(oldProduct);
        res.status(200).json({
          success: true,
          message: "added in Successfully 🙌",
          product: oldProduct,
        });
      }
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
router.post("/getProduct", async (req, res) => {
  try {
    var product = await Product.findById(req.body.id).lean();
    console.log(product);
    res.status(200).json({
      success: true,
      message: "fetched Successfully 🙌 ",
      product: product,
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
router.post("/deleteProduct", async (req, res) => {
  try {
    var product = await Product.findByIdAndDelete(req.query.id);
    for (const images of product.images) {
      const url = images.image;
      const url2 = url.split("/").pop();
      const filename = url2.substring(0, url2.lastIndexOf("."));
      console.log(filename);
      cloudinaryv2.v2.uploader.destroy(
        "Products/" + filename,
        { resource_type: "image", type: "upload" },
        function (error, result) {
          console.log("result:", result);
          console.log("error:", error);
        }
      );
    }
    res.status(200).json({
      success: true,
      message: "deleted Successfully 🙌 ",
      product: product,
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
