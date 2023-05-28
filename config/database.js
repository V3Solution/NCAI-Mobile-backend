const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(process.env.DATABASE)
    .then((data) => {
      console.log(`Mongodb connected with server: ${data.connection.host}`);
    }).catch((err)=>{
      console.log("Database Server Error Message... ",err)
    })
};

module.exports = connectDatabase;