const express = require("express")
const app = express()
const PORT = 3000;

const path = require("path")
const hbs = require('express-handlebars');
const fs = require("fs")


app.set('views', path.join(__dirname, 'views')); // ustalamy katalog views
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' })); // domyślny layout, potem można go zmienić
app.set('view engine', 'hbs'); // określenie nazwy silnika szablonów


app.use(express.urlencoded({
    extended: true
  }));

app.get('/', function (req, res) {
   //let data = ""
    let context = {

    }


    // fs.readFile("./upload/file01.txt",  (err, data) => {
    //     if (err) throw err
    //     console.log("read", data.toString());
    //     const text = data.toString();

    //     context = {
    //         data: data.toString()
    //     }
    // })

    const filepath = path.join(__dirname, "upload", "file01.txt")
    fs.readFile(filepath, "utf-8",  (err, data)=> {
        if (err) throw err
        console.log(data.toString());
    })


    const filepath2 = path.join(__dirname, "upload", "file02.txt")
    fs.writeFile(filepath2, "tekst do wpisania",  (err)=> {
        if (err) throw err
        console.log("plik utworzony");
    })

    fs.appendFile(filepath, "\n\ntekst do dopisania",  (err) =>{
        if (err) throw err
        console.log("plik nadpisany");
    })

    fs.unlink(filepath2,  (err) =>{
        if (err) throw err
        console.log("czas 1: " + new Date().getMilliseconds());
    })
    
    if (fs.existsSync(filepath)) {
        console.log("plik istnieje");
     } else {
         console.log("plik nie istnieje");
     }

    const filepath3 = path.join(__dirname, "upload", "file03.txt")
    const filepath4 = path.join(__dirname, "upload", "file04.txt")

    fs.writeFile(filepath3, "tekst do zapisania", (err) => {
        if (err) throw err
        console.log("plik utworzony - czas 1: " + new Date().getMilliseconds());
    
        fs.appendFile(filepath3, "\n\ntekst do dopisania", (err) => {
            if (err) throw err
            console.log("plik zmodyfikowany - czas 2: " + new Date().getMilliseconds());
        
        })
    })
    //console.log("dataaaaaaaaa", context)


    res.render('view.hbs', context)
})


app.use(express.static('static'))
app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT )
})

