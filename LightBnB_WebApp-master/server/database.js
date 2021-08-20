const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'lightbnb'
});


const properties = require('./json/properties.json');
const users = require('./json/users.json');

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
 const sql = 'SELECT * FROM users WHERE email = $1';
 return pool.query(sql, [email])
    .then(result =>{
      return(result.rows[0]);
    });

}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const sql = 'SELECT * FROM users WHERE id = $1';
  return pool.query(sql, [id])
     .then(result =>{
       return(result.rows[0]);
     });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const sql = 'INSERT INTO users(name, password, email) VALUES($1,$2,$3) RETURNING *;'
  return pool.query(sql, [user.name, user.password, user.email])
    .then(result =>{
      return result;
    })
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
 const getAllReservations = function(guest_id, limit = 10) {
  return pool.query (`select properties.*, reservations.*,avg(rating) as average_rating
  from reservations join
  properties on properties.id = reservations.property_id join property_reviews on properties.id = reservations.property_id where reservations.guest_id = $1 group by properties.id, reservations.id limit $2;
  `, [guest_id,limit])
  .then (result => {
     console.log(result.rows)
     return result.rows;
  })
 
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
 
  return pool
  .query(`SELECT * FROM properties LIMIT $1`, [limit])
  .then((result) => {
    // console.log(result.rows);
    return result.rows
    
  })
  .catch((err) => {
    console.log(err.message);
  }); 
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
