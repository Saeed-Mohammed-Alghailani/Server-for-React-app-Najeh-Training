const express = require('express');

const bodyParser  = require ('body-parser');

const sql = require('./database-config');

const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const cors = require('cors');

const multer = require('multer');

const path = require('path');

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// const port = 3004;
const port = process.env.PORT || 5678;


app.use(cors())

// ============================

const storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
      cb(null, file.originalname.slice(0, file.originalname.lastIndexOf('.')) +"__"+ Date.now() + path.extname(file.originalname));
    },
  });
  
  const upload = multer({ storage: storage });

app.use(bodyParser.json());

const swaggerOptions = {
    swaggerDefinition : {

        info : {
            title   : "Express Server API",
            version : "0.0.1",
            description : "A Simple Express API with Swagger"
        },

        host : "saidmohammed-app-5edbe9f026ce.herokuapp.com",
        basePath : '/',
        schemas : ['http2']
    },
    server : [ { url : `https://saidmohammed-app-5edbe9f026ce.herokuapp.com`}],
    apis : ['./server.js']
}

// =======================================================

const swaggerDocs = swaggerJSDoc(swaggerOptions);

app.use('/api-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/user/:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The user to create
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       201:
 *         description: User Registered successfully
 * 
 * /api/loginuser:
 *   post:
 *     summary: Login a new user
 *     description: Login a new user
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The user to Login
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       201:
 *         description: User Login successfully
 * 
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Returns a list of all products
 *     responses:
 *       200:
 *         description: A list of products
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Product'
 *   post:
 *     summary: Add a new product
 *     description: Adds a new product
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The product to Add
 *         schema:
 *           $ref: '#/definitions/Product'
 *     responses:
 *       201:
 *         description: Product Added successfully
 *
 * /api/product/{id}:
 *   get:
 *     summary: Get a Product by ID
 *     description: Returns a single product by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *         description: The ID of the product
 *     responses:
 *       200:
 *         description: A single product
 *         schema:
 *           $ref: '#/definitions/Product'
 * 
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by Category ID
 *     description: Returns a Products Related to Category ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *         description: The ID of the Category
 *     responses:
 *       200:
 *         description: The Products Related to Category 
 *         schema:
 *           $ref: '#/definitions/Product'
 *   put:
 *     summary: Update a product
 *     description: Updates a product by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *         description: The ID of the product
 *       - in: body
 *         name: product
 *         description: The product to update
 *         schema:
 *           $ref: '#/definitions/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *   delete:
 *     summary: Delete a product
 *     description: Deletes a product by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *         description: The ID of the product
 *     responses:
 *       200:
 *         description: Product deleted successfully
 * 
 *
 * definitions:
 *   User:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *         example: 1
 *       name:
 *         type: string
 *         example: Said
 *       email:
 *         type: string
 *         example: Said@example.com
 *       password:
 *         type: string
 *         example: 32434ghhjrgew
 * 
 *   Product:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *         example: 1
 *       name:
 *         type: string
 *         example: Said
 *       description:
 *         type: string
 *         example: This is a New Product
 *       price:
 *         type: float
 *         example: 5.87
 *       image:
 *         type: string
 *         example: image.jpg
 *       categoryId:
 *         type: integer
 *         example: 1
 *      
 */

// =================== LOGIN SP ================================================
app.post('/api/loginuser', async(req, res) => {          // same as in @swagger 

    try{
        const{email, password} = req.body;
        const result = await sql.query(`Exec Login_sp  @email='${email}', @password='${password}'`);
        
        res.json(result.recordset)
    }

    catch(error){

        res.status(500).send(error.message);
    }
});


// =============================== REGISTER SP ============================================
app.post('/api/user', async(req, res) => {                  // same as @swagger 

    try{
        const {name, email, password} = req.body;
        const result = await sql.query(`Exec Register_sp @name='${name}', @email='${email}', @password='${password}'`);
        res.status(201).json({user: result.recordset, message:'User has been Registered Successfully'});
    }

    catch(error){

        res.status(500).send(error.message);
    }
});

// ===================== LIST PRODUCTS SP ================================

app.get('/api/products', async(req, res) => {                  // same as  in @swagger 

    try{
        const result = await sql.query(`Exec ProductList_sp`);
        res.json(result.recordset);
    }

    catch(error){

        res.status(500).send(error.message);
    }
});

// ===========================Image uploader==================
let UploadedFile;
app.post('/uploads', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('No image uploaded.');
    }
    res.send({ message: 'Image uploaded successfully.' });
    UploadedFile = req.file.filename
    console.log("uploaded file unique name is: ", { UploadedFile });
    
  });

// ===================== Add PRODUCTS SP ================================

app.post('/api/products', async(req, res) => {                  // same as  in @swagger 

        const {name, description, price, image, categoryId} = req.body;
        
    try{
        
        const result = await sql.query(`Exec AddProduct_sp @name='${name}', @description='${description}', @price='${price}', @image='${UploadedFile}', @categoryId='${categoryId}'`);
        console.log('Product image real name is :',  { image } );
        console.log("uploaded file unique name is: ", { UploadedFile });
        res.status(201).json({user: result.recordset, message:'Product has been Added Successfully'});
        UploadedFile = "";
        console.log("uploaded file unique name is: ", { UploadedFile });
    }

    catch(error){

        console.error('Error creating product:', error);
        res.status(500).send(error.message);
    }
});
// =========================== Update Product ID SP ================================

let handleupdate;
app.put('/api/products/:id', async(req, res) => {                  // same as  in @swagger 

    try{
        console.log("uploaded file unique name is: ", { UploadedFile });
        if(UploadedFile === ""){
            handleupdate = unchangedFile;
        }else{
            handleupdate = UploadedFile;
        }
        const {id} = req.params;
        const {name, description, price, image, categoryId} = req.body;
        const result = await sql.query(`Exec UpdateProduct_sp @Id=${id}, @name='${name}', @description='${description}', @price='${price}', @image='${handleupdate}', @categoryId='${categoryId}'`);
        console.log('Product image real name is :',  { image } );
        console.log("uploaded file unique name is: ", { UploadedFile });
        console.log("unchanged file unique name is: ", { unchangedFile });
        console.log("handleupdate file unique name is: ", { handleupdate });
        res.json(result.recordset);
        UploadedFile = "";
        unchangedFile = "";
    }

    catch(error){

        res.status(500).send(error.message);
    }
});

// =========================== Get Product BY Cat SP ================================


app.get('/api/products/:id', async(req, res) => {                  // same as  in @swagger 

    try{
        const {id} = req.params;
        const result = await sql.query(`Exec ProductListByCat_sp @CategoryId=${id}`);
        res.json(result.recordset);
    }

    catch(error){

        res.status(500).send(error.message);
    }
});


// =========================== Get Product BY ID ================================
let unchangedFile;
app.get('/api/product/:id', async(req, res) => {                  // same as  in @swagger 

    try{
        const {id} = req.params;
        const result = await sql.query(`SELECT * FROM Products WHERE Id=${id}`);
        unchangedFile = result.recordset[0].Image;
        console.log("uploaded file is :" + UploadedFile)
        console.log("unchangedFile is: " + unchangedFile)
        console.log("handle is: " + handleupdate)

        res.json(result.recordset);
    }

    catch(error){

        res.status(500).send(error.message);
    }
});



// ===============================  DELETE PRODUCT SP ============================

app.delete('/api/products/:id', async(req, res) => {                  // same as  in @swagger 

    try{
        const {id} = req.params;
        const result = await sql.query(`Exec DeleteProduct_sp @Id=${id}`);
        res.status(201).json({product: result.recordset, message:'Product has been Removed Successfully'});
    }

    catch(error){

        res.status(500).send(error.message);
    }
});

// =======================================================================

app.listen(port, () => {

    console.log(`Server is Running on https://saidmohammed-app-5edbe9f026ce.herokuapp.com`)
    console.log(`Swagger UI is Available on https://saidmohammed-app-5edbe9f026ce.herokuapp.com/api-ui`)

});
