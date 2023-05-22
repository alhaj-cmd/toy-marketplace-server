const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    // await client.connect();

    const toysCollection = client.db('toyMarket').collection('market')
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // creating index on fields
    const indexKeys = { toyName: 1 };
    const indexOptions = { name: "toyTitle" };

    const result = await toysCollection.createIndex(indexKeys, indexOptions);

    // search input field
    app.get("/searchToyname/:text", async (req, res) => {
      const searchText = req.params.text

      console.log(searchText);
      const result = await toysCollection.find({
        $or: [
          { toyName: { $regex: searchText, $options: "i" } }
        ]
      }).toArray()

      res.send(result)
    })


    // get method

    app.get('/toycategory/:category', async (req, res) => {

      if (req.params.category == "Science Toys" || req.params.category == 'Language Toys' || req.params.category == 'Math Toys') {
        const cursor = toysCollection.find({ subCategory: req.params.category })
        const result = await cursor.toArray();
        console.log(result, cursor)
        return res.send(result);

      }

      const cursor = toysCollection.find()
      const result = await cursor.toArray();
      res.send(result);
    })

    //  all category 
    app.get('/allCategory', async (req, res) => {
      const cursor = toysCollection.find().limit(20);
      const result = await cursor.toArray()
      res.send(result);
    })



    // single toy details
    app.get('/allCategory/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id) }

      const options = {
        projection: { toyName: 1, seller: 1, price: 1, subCategory: 1, rating: 1, picture: 1, description: 1, availableQuantity: 1 },
      };

      const result = await toysCollection.findOne(query, options)
      console.log("all data show single data", result);
      res.send(result);
    })



    // my toys
    app.get('/myToys/:email', async (req, res) => {
      const result = await toysCollection.find({ postedBy: req.params.email }).sort({ price: -1 }).toArray();
      res.send(result)
    })

    app.post('/postToy', async (req, res) => {
      const body = req.body;
      const result = await toysCollection.insertOne(body);
      console.log(result);
      res.send(result);
    })
    // Edit api call
    app.patch("/myToys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateCategory = req.body
      console.log(updateCategory);
      const updateCategories = {
        $set: {
          status: updateCategory.status
        },
      };
      const result = await toysCollection.updateOne(filter, updateCategories)
      res.send(result);
    })
    // Delete Api call 
    app.delete('/myToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(query)
      res.send(result);
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('toy marketplace shop running');
})

app.listen(port, () => {
  console.log('toy marketplace server running')
})