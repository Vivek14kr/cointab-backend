const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const request = require("request");
const path = require("path");
const ejs = require("ejs");
const app = express();
const port = 3100;


app.use(express.json());
app.use(cors())
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Vivek@13kr",
  database: "cointab",
});



app.get("/fetch-data", (req, res) => {
  // Make a request to the API to fetch 50 records
  request("https://randomuser.me/api?results=50", (error, response, body) => {
    if (error) {
      // If there was an error, send a response with an error status code
      res.status(500).send(error);
    } else {
      // Parse the response body as JSON
      const data = JSON.parse(body);

      // Keep track of the number of successful insertions
      let insertCount = 0;

      data.results.forEach((user) => {
        connection.query(
          "INSERT INTO your_table (gender, first_name, last_name, email, phone, cell, street, city, state, country, postcode, latitude, longitude, dob, registered, picture_large, picture_medium, picture_thumbnail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            user.gender,
            user.name.first,
            user.name.last,
            user.email,
            user.phone,
            user.cell,
            user.location.street.name,
            user.location.city,
            user.location.state,
            user.location.country,
            user.location.postcode,
            user.location.coordinates.latitude,
            user.location.coordinates.longitude,
            user.dob.date,
            user.registered.date,
            user.picture.large,
            user.picture.medium,
            user.picture.thumbnail,
          ],
          (error, results) => {
            if (error) {
              // If there was an error, send a response with an error status code
              res.status(500).send(error);
            } else {
              // Increment the insert count
              insertCount++;
            }
          }
        );
      });

      // Wait for all insertions to complete before sending

      if (insertCount === data.results.length) {
        // All insertions were successful
        res.status(200).send("All data inserted successfully");
      } else {
        // Some insertions failed
        res.status(500).send("Some data failed to insert");
      }
    }
  });
});

app.get("/delete-users", (req, res) => {
  connection.query("DELETE FROM your_table", (error, results) => {
    if (error) {
      // If there was an error, send a response with an error status code
      res.status(500).send(error);
    } else {
      // If the data was deleted successfully, send a response with a success status code
      res.status(200).send({
        "message": "Data deleted successfully",

      });
    }
  });
});
app.get("/user-details", (req, res) => {
  // Set default values for the pagination and filter params
  const page = req.query.page || 1;
  const filter = req.query.filter || "";
  let totalcount = 0;

  // Set the limit and offset for the pagination
  const limit = 10;
  const offset = (page - 1) * limit;

  let newsql = " SELECT COUNT(*) FROM your_table";

  connection.query(newsql, (error, results, fields) => {

    if (error){
        console.log(error);

    }else{
      
        let kres = results
        const { "COUNT(*)": count } = kres[0]
        totalcount = count;

      
    }
  }
  )
  
  // Build the SELECT statement with the pagination and filter params
  let sql = "SELECT * FROM your_table";
 
  if (filter) {
    sql += ` WHERE first_name LIKE '%${filter}%' OR last_name LIKE '%${filter}%' OR email LIKE '%${filter}%'`;
  }
  sql += ` LIMIT ${limit} OFFSET ${offset}`;

  // Execute the SELECT statement
  connection.query(sql, (error, results) => {
    if (error) {
      // If there was an error, send a response with an error status code
      res.status(500).send(error);
    } else {
      // If the data was retrieved successfully, render the HTML for the page
      console.log(results[0]);
      console.log(totalcount)
      
      var totalPages = Math.ceil(totalcount/ limit);
      
      var currentPage = page;
      res.send({

        "users": results,
        "totalPages": totalPages,
        "currentPage": +currentPage,
       
      });
    }
  });
});

app.get("/filter-details", (req, res) => {
  // Set default values for the pagination and filter params

  const filter = req.query.filter || "";
  
  // Build the SELECT statement with the pagination and filter params
  let sql = "SELECT * FROM your_table";

  if (filter) {
    sql += ` WHERE first_name LIKE '%${filter}%' OR last_name LIKE '%${filter}%' OR email LIKE '%${filter}%'`;
  }
 

  // Execute the SELECT statement
  connection.query(sql, (error, results) => {
    if (error) {
      // If there was an error, send a response with an error status code
      res.status(500).send(error);
    } else {
      // If the data was retrieved successfully, render the HTML for the page
    
      
      res.send({
        users: results,
     
      });
    }
  });
});
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
