const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

// mongoDB



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4s3yid7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db('toyMarket').collection('market')
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // get method
    app.get('/toycategory/:category', async(req,res) => {
      
        if(req.params.category == "Science Toys" || req.params.category == 'Language Toys' || req.params.category == 'Math Toys') {
            const cursor = toysCollection.find({subCategory: req.params.category})
        const result = await cursor.toArray();
        console.log(result, cursor)
       return res.send(result);

        }

        const cursor = toysCollection.find()
        const result = await cursor.toArray();
        res.send(result);
    })


    // my toys
    app.get('/myToys/:email', async(req, res) =>{
      console.log('hitting the route',req.params.email);
      const result = await toysCollection.find({postedBy : req.params.email }).toArray();
      res.send(result)
    })

    app.post('/postToy', async(req, res) => {
        const body = req.body;
        const result = await toysCollection.insertOne(body);
        console.log(result);
        res.send(result);
    } )

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req,res) =>{
    res.send('toy marketplace shop running');
})

app.listen(port,() =>{
    console.log('toy marketplace server running')
})