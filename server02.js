const fs = require("fs")
const path = require("path")

if (!fs.existsSync("./newdir")) {
    fs.mkdir("./newdir", (err) => {
        if (err) throw err
        console.log("jest");
        if (fs.existsSync("./newdir")) {
            fs.rmdir("./newdir", (err) => {
                if (err) throw err
                console.log("nie ma ");
            })
        }
    })
}


fs.readdir(__dirname, (err, files) => {
    if (err) throw err

    // foreach

    files.forEach((file) => {
        fs.lstat("./upload", (err, stats) => {
            console.log(file, stats.isDirectory());
        })
    })

 

})

try {
    fs.mkdirSync("./upload/test")
}
catch (err) {
    console.log("error", err.message);
}