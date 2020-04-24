const express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const app = express();
const multer = require('multer');
var MongoClient = require('mongodb').MongoClient;
fs = require('fs-extra');
app.use(bodyParser.urlencoded({extended: true}));
ObjectId = require('mongodb').ObjectId;

var url = 'mongodb+srv://duynvkgch18205:vokhanhduy@cluster0-ttavy.mongodb.net/test';

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var upload = multer({storage: storage});

MongoClient.connect(url, (err, client) => {
    if (err) return console.log(err);
    db = client.db("ATNdata")
});

router.get('/',async (req,res)=>{
    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNdata");
    let results = await dbo.collection("product").find({}).toArray();
    res.render('allProduct',{product:results});
})

//Update
router.get('/edit', async(req,res)=>{
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;

    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNdata");
    let result = await dbo.collection("product").findOne({"_id" : ObjectID(id)});
    res.render('edit',{product:result});
})

router.post('/edit', upload.single('picture'), async(req,res)=>{
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');
    let id = req.body.id;
    let name = req.body.productName;
    let price = req.body.productPrice;
    let type = req.file.mimetype;
    let picture = new Buffer(encode_image, 'base64');
    let newValues ={$set : {ProductName: name, ProductPrice: price, contentType: type, ProductPicture: picture}};
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};
    
    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNdata");
    await dbo.collection("product").updateOne(condition, newValues, (err, result)=>{
        console.log(result)
        if (err) return console.log(err)
        console.log('saved to database')
    });
    let results = await dbo.collection("product").find({}).toArray();
    res.render('allProduct', {product:results});
})

//sanpham/insert->browser
router.get('/insert',(req,res)=>{
    res.render('insert');
})
router.post('/insert', upload.single('picture'), async (req,res)=>{
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');
    var newProduct = {
        ProductName: req.body.productName,
        ProductPrice: req.body.productPrice,
        ProductPicture: new Buffer(encode_image, 'base64'),
        contentType: req.file.mimetype
    };
    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNdata");
    await dbo.collection("product").insertOne(newProduct, (err, result) => {
        console.log(result)
        if (err) return console.log(err)
        console.log('saved to database')
    });
    let results = await dbo.collection("product").find({}).toArray();
    res.render('allProduct',{product:results});
});

router.get('/photos/:id', (req, res) => {
    var filename = req.params.id;
    db.collection("product").findOne({'_id': ObjectId(filename)}, (err, result) => {
        if (err) return console.log(err)
        res.contentType('image/jpeg')
        res.send(result.ProductPicture.buffer)
    })
});

//Search -> get
router.get('/search',(req,res)=>{
    res.render('search');
})

//Search -> post
router.post('/search',async (req,res)=>{
    let searchProduct = req.body.productName;
    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNdata");
    let results = await dbo.collection("product").find({"ProductName":searchProduct}).toArray();
    res.render('allProduct',{product:results});
})

//Delete (GET method)
router.get('/delete', async (req,res)=>{
    let client= await MongoClient.connect(url);
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let dbo = client.db("ATNdata");
    let condition = {"_id" : ObjectID(id)};
    await dbo.collection("product").deleteOne(condition);
    let results = await dbo.collection("product").find({}).toArray();
    res.render('allProduct',{product:results});
})
module.exports = router;