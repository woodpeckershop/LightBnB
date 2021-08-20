const { Pool } = require("pg");

const pool = new Pool({
  user: "labber",
  password: "labber",
  host: "localhost",
  database: "lightbnb",
});

const properties = require("./json/properties.json");
const users = require("./json/users.json");

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  const sql = "SELECT * FROM users WHERE email = $1";
  return pool.query(sql, [email]).then((result) => {
    return result.rows[0];
  });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  const sql = "SELECT * FROM users WHERE id = $1";
  return pool.query(sql, [id]).then((result) => {
    return result.rows[0];
  });
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const sql =
    "INSERT INTO users(name, password, email) VALUES($1,$2,$3) RETURNING *;";
  return pool
    .query(sql, [user.name, user.password, user.email])
    .then((result) => {
      return result;
    });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return pool
    .query(
      `select properties.*, reservations.*,avg(rating) as average_rating
  from reservations join
  properties on properties.id = reservations.property_id join property_reviews on properties.id = reservations.property_id where reservations.guest_id = $1 group by properties.id, reservations.id limit $2;
  `,
      [guest_id, limit]
    )
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    });
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_id
    `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night);
    queryString += `AND $${queryParams.length}<=(properties.cost_per_night/100) `;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night);
    queryString += `AND $${queryParams.length} >=(properties.cost_per_night/100) `;
  }
  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += `AND $${queryParams.length} = properties.owner_id `;
  }
  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `GROUP BY properties.id HAVING $${queryParams.length} >= avg(rating)`;
  }

  // 4
  queryParams.push(limit);
  if (!options.minimum_rating) {
    queryString += `GROUP BY properties.id`;
  }
  queryString += `
    
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
    `;

  // 5
  // console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams).then((res) => {
    // console.log(res.rows)
    return res.rows;
  });
};
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const queryString = `INSERT INTO properties 
  (owner_id, 
  title, 
  description, 
  thumbnail_photo_url, 
  cover_photo_url, 
  cost_per_night, 
  street, 
  city, 
  province, 
  post_code, 
  country, 
  parking_spaces, 
  number_of_bathrooms, 
  number_of_bedrooms)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING * ;`;

  const queryParams = [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms,
  ];

  return pool
    .query(queryString, queryParams)
    .then((result) => {
      return result.rows[0];
    })
    .catch((error) => console.log(error.message));
};

exports.addProperty = addProperty;
