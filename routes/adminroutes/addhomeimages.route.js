const express = require("express");
const auth = require("../../middleware/auth");
const HomeImage = require("../../models/homeimages.model");
const upload = require("../../middleware/multer");
const router = express.Router();
const cloudinary = require("../../config/cloudinary.js");
const fs = require("fs");

uploadImage = upload.array("image");

router.post("/addHomeImages", auth, async (req, res) => {
  uploadImage(req, res, async function (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({ message: err.message });
    }
    const uploader = async (path) =>
      await cloudinary.uploads(path, "HomepageImages");
    try {
      const files = req.files;
      for (const file of files) {
        const path = await file.path;
        const newPath = await uploader(path);
        console.log(newPath);
        const newProduct = new HomeImage({
          image: newPath.url,
        });
        await newProduct.save();
        fs.unlinkSync(path);
      }
      console.log(files);
      var images = await HomeImage.find({}).lean();

      res.status(200).json({
        success: true,
        message: "added in Successfully 🙌 ",
        images: images,
      });
    } catch (err) {
      console.log(err);
      res.status(200).json({
        success: false,
        message: err.message,
      });
    }
  });
});

router.post("/getHomeimages", async (req, res) => {
  try {
    var images = await HomeImage.find({}).lean();

    res.status(200).json({
      success: true,
      message: "fetched Successfully 🙌 ",
      images: images,
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
router.post("/deleteHomeimage", async (req, res) => {
  try {
    console.log("hitted delete" + req.query.id);
    var images = await HomeImage.findByIdAndDelete(req.query.id);

    res.status(200).json({
      success: true,
      message: "deleted Successfully 🙌 ",
      images: images,
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
