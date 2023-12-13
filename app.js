const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const { MongoClient } = require("mongodb");

class damRow {
  constructor(id, name, level, capacity, inflow, outflow, date) {
    this.damID = id;
    this.name = name;
    this.level = level;
    this.capacity = capacity;
    this.inflow = inflow;
    this.outflow = outflow;
    this.date = date;
  }
}

let dailyData = [];
const client = new MongoClient();
//URI goes here

async function testConnection() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function testRetrieve() {
  try {
    await client.connect();
    const result = await client
      .db("damboard")
      .collection("dailyWaterLevels")
      .findOne({ name: "Mettur Dam" });
    console.log(result);
  } finally {
    client.close();
  }
}

async function testInsert12() {
  try {
    await client.connect();
    const result = await client
      .db("damboard")
      .collection("dailyWaterLevels")
      .insertOne({ name: "Mettur Dam" });
    console.log(result);
  } finally {
    client.close();
  }
}

async function testInsert(bulkData) {
  console.log("test");
  try {
    await client.connect();
    console.log(bulkData[0]);
    let result = await client
      .db("damboard")
      .collection("dailyWaterLevels")
      .insertMany(bulkData);
  } catch (error) {
    console.log(error);
  } finally {
    console.log(result);
    client.close();
  }
}

//name          tr:nth-child(n) > td:nth-child(1)
//levelinfeet   tr:nth-child(n) > td:nth-child(4)
//levelinvol    tr:nth-child(n) > td:nth-child(5)
//inflow        tr:nth-child(n) > td:nth-child(6)
//outflow       tr:nth-child(n) > td:nth-child(7)testRetrieve();

testScrape = () => {
  let sitedata;
  let i = 0;
  axios.get("http://122.15.179.102/ARS/home/reservoir/").then((response) => {
    sitedata = cheerio.load(response.data);

    for (i = 1; i < 37; i = i + 2) {
      let damID = i;
      let name = sitedata("tr:nth-child(" + i + ") > td:nth-child(1)").text();
      let levelinfeet = sitedata(
        "tr:nth-child(" + i + ") > td:nth-child(4)"
      ).text();
      let levelinvol = sitedata(
        "tr:nth-child(" + i + ") > td:nth-child(5)"
      ).text();
      let inflow = sitedata("tr:nth-child(" + i + ") > td:nth-child(6)").text();
      let outflow = sitedata(
        "tr:nth-child(" + i + ") > td:nth-child(7)"
      ).text();
      let date = new Date();
      let tempRow = new damRow(
        damID,
        name,
        levelinfeet,
        levelinvol,
        inflow,
        outflow,
        date
      );
      dailyData.push(tempRow);
    }
    testInsert(dailyData);
  });
};

//testScrape();
