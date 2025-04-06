const express = require("express")
const app = express()
const PORT = 3000;

const path = require("path")
const hbs = require('express-handlebars');
const fs = require("fs")
const formidable = require('formidable');

app.set('views', path.join(__dirname, 'views'));  // ustalamy katalog views
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));  // domyślny layout, potem można go zmienić
app.set('view engine', 'hbs');  // określenie nazwy silnika szablonów


app.use(express.urlencoded({
    extended: true
  }));

  const folderpath = path.join(__dirname, 'files');

  const getFiles = async () => {
      const myFolders = [];
      const myFiles = [];
  
      try {
          const files = await fs.promises.readdir(folderpath);
  
          for (const file of files) {
              const filepath = path.join(folderpath, file);
              const stats = await fs.promises.lstat(filepath);
  
              if (stats.isDirectory()) {
                  myFolders.push({ folder: file });
              } else {
                  myFiles.push({ file: file });
              }
          }
  
          return { files: myFiles, folders: myFolders };
      } catch (err) {
          console.error('Error reading files:', err);
          return { files: [], folders: [] };
      }
  };

  app.get('/', async (req, res) => {
    const context = await getFiles();
    res.render('filemanager.hbs', context);
});

app.post('/addNewFolder', async (req, res) => {
    const folderName = req.body.folder_name?.trim();

    if (folderName) {
        let folderFullPath = path.join(folderpath, folderName);
        let counter = 0
        let i= ""
        console.log(folderFullPath+i)
        while (fs.existsSync(folderFullPath + i)){
            counter ++
            i = `(${counter})`
            console.log(folderFullPath+i)
        }
        try {
            await fs.promises.mkdir(folderFullPath + i, { recursive: true });
            console.log("Folder created:", folderName + i);
        } catch (err) {
            console.error("Error creating folder:", err.message);
        }
    }

    res.redirect('/');
});

app.post('/addNewFile', async (req, res) => {
    let fileName = req.body.file_name?.trim();

    if (fileName) {
        if (!path.extname(fileName)) {
            fileName += '.txt';
        }

        const baseName = path.basename(fileName, path.extname(fileName));
        const ext = path.extname(fileName);
        let fileFullPath = path.join(folderpath, fileName);

        let counter = 0;
        while (fs.existsSync(fileFullPath)) {
            counter++;
            const numberedName = `${baseName}(${counter})${ext}`;
            fileFullPath = path.join(folderpath, numberedName);
        }

        try {
            await fs.promises.writeFile(fileFullPath, "");
            console.log("File created:", fileFullPath);
        } catch (err) {
            console.error("Error creating file:", err.message);
        }
    }

    res.redirect('/');
});

app.post('/deleteFolder', async (req, res) => {
    const folderName = req.body.folder_name?.trim();

    if (folderName) {
        let folderFullPath = path.join(folderpath, folderName);
        try {
            await fs.promises.rmdir(folderFullPath, { recursive: true });
            console.log("Folder deleted:", folderName);
        } catch (err) {
            console.error("Error creating folder:", err.message);
        }
    }

    res.redirect('/');
});

app.post('/deleteFile', async (req, res) => {
    const fileName = req.body.file_name?.trim();

    if (fileName) {
        let fileFullPath = path.join(folderpath, fileName);
        try {
            await fs.promises.unlink(fileFullPath, { recursive: true });
            console.log("Folder deleted:", fileName);
        } catch (err) {
            console.error("Error creating folder:", err.message);
        }
    }

    res.redirect('/');
});

app.post('/uploadFiles', (req, res) => {
    const form = new formidable.IncomingForm();
    form.multiples = true;
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Form parse error:', err);
            return res.status(500).send('Form error');
        }

        const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files];

        for (const file of uploadedFiles) {
            const oldPath = file.path; // ✅ Use .path for Formidable v1
            const originalName = file.name || 'unnamed.txt';

            const ext = path.extname(originalName) || '.txt';
            const base = path.basename(originalName, ext);

            let finalName = originalName;
            let counter = 0;
            let targetPath = path.join(folderpath, finalName);

            while (fs.existsSync(targetPath)) {
                counter++;
                finalName = `${base}(${counter})${ext}`;
                targetPath = path.join(folderpath, finalName);
            }

            try {
                await fs.promises.rename(oldPath, targetPath);
                console.log('File saved:', finalName);
            } catch (moveErr) {
                console.error('Error moving file:', moveErr);
            }
        }

        res.redirect('/');
    });
});

app.use(express.static('static'))
app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT )
})

