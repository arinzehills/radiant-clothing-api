const multer = require("multer");
const Path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "image") {
    //for images
    const validExts = [".png", ".jpg", ".jpeg"];
    if (!validExts.includes(Path.extname(file.originalname))) {
      console.log(Path.extname(file.originalname));
      //reject file
      cb(
        {
          message: "Unsupported file format",
          ext: Path.extname(file.originalname),
        },
        false
      );
    } else {
      cb(null, true);
    }
  } else if (file.fieldname === "video" || file.fieldname === "videos") {
    //for images
    const validExts = [
      ".WEBM",
      ".MP2",
      ".MPG",
      ".MPE",
      ".MPEG",
      ".MPV",
      ".OGG",
      ".mp4",
      ".M4P",
      ".M4V",
      ".MOV",
    ];
    if (!validExts.includes(Path.extname(file.originalname))) {
      //reject file
      cb(
        {
          message: "Unsupported file format",
          ext: Path.extname(file.originalname),
        },
        false
      );
    } else {
      cb(null, true);
    }
  } else {
    //for files
    const validExts = [".pdf", ".doc", ".docx"];
    if (!validExts.includes(Path.extname(file.originalname))) {
      //reject file
      cb(
        {
          message: "Unsupported file format",
          ext: Path.extname(file.originalname),
        },
        false
      );
    } else {
      cb(null, true);
    }
  }
  // if (
  //   file.mimetype === "application/pdf" ||
  //   file.mimetype === "application/msword" ||
  //   file.mimetype ===
  //     "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  // ) {
  //   cb(null, true);
  // } else {
  //   //reject file
  //   cb(
  //     {
  //       message: "Unsupported file format",
  //     },
  //     false
  //   );
  // }
};

const upload = multer({
  storage: storage,
  //   limits: {
  //     fileSize: 1024 * 1024,
  //   },
  fileFilter: fileFilter,
});

module.exports = upload;
