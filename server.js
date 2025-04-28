const express = require("express");
const app = express();
const PORT = 3000;

const path = require("path");
const hbs = require("express-handlebars");
const fs = require("fs");
const JSZip = require("jszip");
const formidable = require("formidable");

app.set("views", path.join(__dirname, "views"));
app.engine(
  "hbs",
  hbs({
    defaultLayout: "main.hbs",
    helpers: {
      ifHome: function (root) {
        if (root == "" || root == "/") {
          return "";
        } else {
          const btn = document.createElement("button");
          btn.innerText = "rename folder";
          btn.classList.add("rename_folder");
          return btn;
        }
      },
    },
  })
);

app.use(express.static("static"));

app.set("view engine", "hbs");

app.use(
  express.urlencoded({
    extended: true,
  })
);

const content = require("./data/data.json");
let folderpath = path.join(__dirname, "files");
// let queryPath = "";

const getContext = async (queryPath) => {
  let showBtn = false;
  if (queryPath != "" && queryPath != "/") {
    showBtn = true;
  }
  folderpath = path.join(__dirname, `files${queryPath}`);
  const myFolders = [];
  const myFiles = [];
  const linkPath = [];

  //console.log("queryPath:", queryPath);

  const segments = queryPath
    .split("/")
    .filter((seg, index) => seg !== "" || index === 0);

  let link = "?path=";
  segments.forEach((segment, index) => {
    if (index === 0 && segment === "") {
      linkPath.push({ name: "home", path: link });
    } else {
      linkPath.push({ name: "->" });
      link += "/" + segment;
      linkPath.push({ name: segment, path: link });
    }
  });

  try {
    const files = await fs.promises.readdir(folderpath);

    for (const file of files) {
      const filepath = path.join(folderpath, file);
      const stats = await fs.promises.lstat(filepath);

      if (stats.isDirectory()) {
        myFolders.push({ folder: file });
      } else {
        myFiles.push({ file: file, ext: path.extname(file).slice(1) });
      }
    }
    // console.log({
    //   root: queryPath,
    //   path: linkPath,
    //   files: myFiles,
    //   folders: myFolders,
    // });
    return {
      showBtn: showBtn,
      root: queryPath,
      path: linkPath,
      files: myFiles,
      folders: myFolders,
    };
  } catch (err) {
    console.error("Error reading files:", err);
    throw new Error("No such path: " + queryPath);
  }
};

const getFileContext = async (queryPath) => {
  folderpath = path.join(__dirname, `files${queryPath}`);
  const linkPath = [];

  //console.log("queryPath:", queryPath);

  const segments = queryPath
    .split("/")
    .filter((seg, index) => seg !== "" || index === 0);

  let link = "?path=";
  segments.forEach((segment, index) => {
    if (index === 0 && segment === "") {
      linkPath.push({ name: "home", path: link });
    } else {
      linkPath.push({ name: "->" });
      link += "/" + segment;
      linkPath.push({ name: segment, path: link });
    }
  });

  let data = ""
  try {
    data = await fs.readFileSync(folderpath, 'utf8',  { recursive: true });
    console.log(data);
    // console.log({
    //   root: queryPath,
    //   path: linkPath,
    //   files: myFiles,
    //   folders: myFolders,
    // });
    return {
      text: data,
      root: queryPath,
      path: linkPath,
    };
  } catch (err) {
    console.error("Error reading files:", err);
    throw new Error("No such path: " + queryPath);
  }
};


app.get("/", async (req, res) => {
  try {
    const queryPath = req.query.path || "";
    const context = await getContext(queryPath);
    res.render("filemanager.hbs", context);
  } catch (error) {
    res.send(error.message);
  }
});


app.get("/showfile", async (req, res) => {
  try {
    const queryPath = req.query.name || "";
    const context = await getFileContext(queryPath);
    res.render("textFile.hbs", context);
  } catch (error) {
    res.send(error.message);
  }
})

app.post("/addNewFolder", async (req, res) => {
  const queryPath = req.body.query_path || "";
  const folderName = req.body.folder_name?.trim();

  if (folderName) {
    let folderFullPath = path.join(folderpath, folderName);
    let counter = 0;
    let i = "";
    console.log(folderFullPath + i);
    while (fs.existsSync(folderFullPath + i)) {
      counter++;
      i = `(${counter})`;
      console.log(folderFullPath + i);
    }
    try {
      await fs.promises.mkdir(folderFullPath + i, { recursive: true });
      console.log("Folder created:", folderName + i);
    } catch (err) {
      console.error("Error creating folder:", err.message);
    }
  }

  res.redirect(`/?path=${queryPath}`);
});

app.post("/renameFolder", async (req, res) => {
  const oldName = req.body.old_name?.trim();
  const newName = req.body.new_name?.trim();

  arr = oldName.split("/");
  arr.pop();
  renameQueryPath = arr.join("/");

  let i = "";
  if (oldName && newName) {
    let newFullPath = path.join(
      __dirname,
      "files" + renameQueryPath + "/" + newName
    );
    let oldFullPath = path.join(folderpath);
    let counter = 0;

    console.log(newFullPath + i);
    while (fs.existsSync(newFullPath + i)) {
      counter++;
      i = `(${counter})`;
    }
    newFullPath += i;
    try {
      await fs.rename(oldFullPath, newFullPath, (err) => {
        console.log("Folder renamed: ", newName + i);
      });
    } catch (err) {
      console.error("Error creating folder:", err.message);
    }
  }

  res.redirect(`/?path=${renameQueryPath + "/" + newName + i}`);
});

app.post("/renameFolder", async (req, res) => {
  const oldName = req.body.old_name?.trim();
  const newName = req.body.new_name?.trim();

  arr = oldName.split("/");
  arr.pop();
  renameQueryPath = arr.join("/");

  let i = "";
  if (oldName && newName) {
    let newFullPath = path.join(
      __dirname,
      "files" + renameQueryPath + "/" + newName
    );
    let oldFullPath = path.join(folderpath);
    let counter = 0;

    console.log(newFullPath + i);
    while (fs.existsSync(newFullPath + i)) {
      counter++;
      i = `(${counter})`;
    }
    newFullPath += i;
    try {
      await fs.rename(oldFullPath, newFullPath, (err) => {
        console.log("Folder renamed: ", newName + i);
      });
    } catch (err) {
      console.error("Error creating folder:", err.message);
    }
  }

  res.redirect(`/?path=${renameQueryPath + "/" + newName + i}`);
});

app.post("/addNewFile", async (req, res) => {
  const queryPath = req.body.query_path || "";
  const extension = req.body.extension.slice(1);
  let fileName = req.body.file_name?.trim();

  if (fileName) {
    console.log(extension, content.txt, content[extension]);
    fileName += "." + extension;
    const text = content[extension];
    console.log("text", text);

    const baseName = path.basename(fileName, path.extname(fileName));
    const ext = path.extname(fileName);
    let folderFullPath = path.join(__dirname, "files" + queryPath);
    let fileFullPath = path.join(folderFullPath, fileName);

    let counter = 0;
    while (fs.existsSync(fileFullPath)) {
      counter++;
      const numberedName = `${baseName}(${counter})${ext}`;
      fileFullPath = path.join(folderFullPath, numberedName);
    }

    try {
      await fs.promises.writeFile(fileFullPath, text ?? "");
      console.log("File created:", fileFullPath);
    } catch (err) {
      console.error("Error creating file:", err.message);
    }
  }

  res.redirect(`/?path=${queryPath}`);
});

app.post("/deleteFolder", async (req, res) => {
  const queryPath = req.body.query_path || "";
  const folderName = req.body.folder_name?.trim();

  if (folderName) {
    let folderFullPath = path.join(folderpath, folderName);
    try {
      await fs.promises.rmdir(folderFullPath, { recursive: true });
      console.log("Folder deleted:", folderName);
    } catch (err) {
      console.error("Error deleting folder:", err.message);
    }
  }

  res.redirect(`/?path=${queryPath}`);
});

app.post("/deleteFile", async (req, res) => {
  const queryPath = req.body.query_path || "";
  const fileName = req.body.file_name?.trim();

  if (fileName) {
    let fileFullPath = path.join(folderpath, fileName);
    try {
      await fs.promises.unlink(fileFullPath, { recursive: true });
      console.log("File deleted:", fileName);
    } catch (err) {
      console.error("Error deleting file:", err.message);
    }
  }
  console.log("delete: ", queryPath);
  res.redirect(`/?path=${queryPath}`);
});

app.post("/downloadFolder", async (req, res) => {
  const folderName = req.body.folder_name?.trim();

  if (!folderName) {
    return res.status(400).send("No folder specified.");
  }

  const folderFullPath = path.join(folderpath, folderName);
  const zip = new JSZip();

  // Helper to recursively add files and folders
  async function addFolderToZip(zipFolder, folderPath) {
    const entries = await fs.promises.readdir(folderPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(folderPath, entry.name);
      if (entry.isDirectory()) {
        const newZipFolder = zipFolder.folder(entry.name);
        await addFolderToZip(newZipFolder, fullPath);
      } else {
        const fileContent = await fs.promises.readFile(fullPath);
        zipFolder.file(entry.name, fileContent);
      }
    }
  }

  try {
    await addFolderToZip(zip.folder(folderName), folderFullPath);

    const zipContent = await zip.generateAsync({ type: "nodebuffer" });

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${folderName}.zip"`,
    });

    res.send(zipContent);
  } catch (err) {
    console.error("Error creating zip:", err);
    res.status(500).send("Error creating zip file.");
  }
});

app.post("/downloadFile", async (req, res) => {
  const fileName = req.body.file_name?.trim();

  if (fileName) {
    let fileFullPath = path.join(folderpath, fileName);
    res.download(fileFullPath, (err) => {
      if (err) {
        console.error("Download error:", err.message);
        res.status(500).send("File download failed.");
      }
    });
  } else {
    res.status(400).send("No file specified.");
  }
});

app.post("/uploadFiles", (req, res) => {
  const form = new formidable.IncomingForm();
  form.multiples = true;
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).send("Form error");
    }

    const queryPath = fields.query_path || "";

    const uploadedFiles = Array.isArray(files.files)
      ? files.files
      : [files.files];

    for (const file of uploadedFiles) {
      const oldPath = file.path;
      const originalName = file.name || "unnamed.txt";

      const ext = path.extname(originalName) || ".txt";
      const base = path.basename(originalName, ext);

      let finalName = originalName;
      let counter = 0;
      let targetPath = path.join(__dirname, "files" + queryPath, finalName);

      while (fs.existsSync(targetPath)) {
        counter++;
        finalName = `${base}(${counter})${ext}`;
        targetPath = path.join(__dirname, "files" + queryPath, finalName);
      }

      try {
        await fs.promises.rename(oldPath, targetPath);
        console.log("File saved:", finalName);
      } catch (moveErr) {
        console.error("Error moving file:", moveErr);
      }
    }
    console.log("upl: ", queryPath);
    res.redirect(`/?path=${queryPath}`);
  });
});

app.get("*", async (req, res) => {
  res.send("no such path");
});

app.listen(PORT, function () {
  console.log("start serwera na porcie " + PORT);
});
