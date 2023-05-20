const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()

const port = process.env.PORT || 5000;

const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
}
app.use(cors(corsConfig))
app.options("", cors(corsConfig))

// app.use(function(req, res, next) {
//   // Set the allowed origin to "*" to allow requests from any origin
//   res.setHeader('Access-Control-Allow-Origin', '*');

//   // Additional headers to allow (optional)
//   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

//   // Set the allowed methods (optional)
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

//   next();
// });



app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.arwkaoj.mongodb.net/?retryWrites=true&w=majority`;

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

    const toyCollections = client.db('toyMarket').collection('toys')

    const indexKeys = { name: 1, salername: 1 }
    const indexOptions = { name: "serchName" }

    const result = await toyCollections.createIndex(indexKeys, indexOptions)


    //=======Search by name----------------->>>>
    app.get('/serchByName/:text', async (req, res) => {
      const searchText = req.params.text;
      const result = await toyCollections.find(
        {
          $or: [
            { name: { $regex: searchText, $options: "i" } },
            { salername: { $regex: searchText, $options: "i" } },
          ],
        }
      ).toArray()
      res.send(result)
    })

    //===========Dssending---------------->>>>>>>>
    app.get('/descending', async(req, res)=>{
      let query= {}
      if(req.query?.email){
        query = { email: req.query.email}
      }
      const result = await toyCollections.find(query).sort({price: 1}).toArray()
      res.send(result);
    })

        //===========Assending---------------->>>>>>>>
        app.get('/aescending', async(req, res)=>{
          let query= {}
          if(req.query?.email){
            query = { email: req.query.email}
          }
          const result = await toyCollections.find(query).sort({price: -1}).toArray()
          res.send(result);
        })


    //Post Add toy to Fetch here-------
    app.post('/postToy', async (req, res) => {
      const body = req.body;
      const result = await toyCollections.insertOne(body)
      res.send(result)
      console.log(result)
    })

    app.get('/allToy', async (req, res) => {
      const result = await toyCollections.find({}).toArray()
      res.send(result)
    })

    app.get('/allToy/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await toyCollections.findOne(query)
      res.send(result)
    })

    //delete operationss-------------------
    app.delete('/allToy/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await toyCollections.deleteOne(query)
      res.send(result)
    })

    //----Update------------
    app.put('/allToy/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updatedToyInfo = req.body
      const toyInfo = {
        $set: {
          name: updatedToyInfo.name,
          price: updatedToyInfo.price,
          description: updatedToyInfo.description,
          quantity: updatedToyInfo.quantity,
          rating: updatedToyInfo.rating,
        }
      }
      const result = await toyCollections.updateOne(filter, toyInfo, options)
      res.send(result);
    })

    app.get('/myToy/:email', async(req,res)=>{
      console.log(req.params.email)
      const result = await toyCollections.find({postedBy:req.params.email}).toArray()
      res.send(result);
    })


    app.put("/updateInfo/:id", async(req,res)=>{
      const id =req.params.id
      console.log(id);
      const body = req.body
      console.log(body);

      const filter = { _id: new ObjectId(id)}
      console.log(filter);


    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('toy market place')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})