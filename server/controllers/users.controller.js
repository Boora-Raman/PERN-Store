const pool = require("../config");
const { hashPassword } = require("../utils/hashPassword");

const getAllUsers = async (req, res) => {
  try {
    const results = await pool.query("select * from users");
    res.status(200).json(results.rows);
  } catch (error) {
    res.status(500).json(error);
  }
};

const createUser = async (req, res) => {
  const { username, password, email, fullname } = req.body;
  const hashedPassword = hashPassword(password);
  try {
    const results = await pool.query(
      "INSERT INTO users(username, password, email, fullname) VALUES($1, $2, $3, $4) returning *",
      [username, hashedPassword, email, fullname]
    );
    res.status(200).json({
      status: "success",
      data: results.rows[0],
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;
  if (+id == req.user.id || req.user.roles.includes("admin")) {
    try {
      const {
        rows: user,
      } = await pool.query("select * from users where user_id = $1", [id]);
      user[0].password = undefined;
      user[0].google_id = undefined;
      return res.status(200).json(user[0]);
    } catch (error) {
      return res.status(500).json(error);
    }
  }
  return res.status(401).json({ message: "Unauthorized" });
};

const updateUser = async (req, res) => {
  const { username, password, email, fullname } = req.body;
  const { id } = req.params;
  if (+id == req.user.id || req.user.roles.includes("admin")) {
    try {
      const results = await pool.query(
        "UPDATE users set username = $1, password = $2, email = $3, fullname = $4 where user_id = $5 returning *",
        [username, password, email, fullname, id]
      );
      res.status(200).json(results.rows[0]);
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (+id == req.user.id || req.user.roles.includes("admin")) {
    try {
      const results = await pool.query(
        "DELETE FROM users where user_id = $1 returning *",
        [id]
        );
        res.status(200).json(results.rows[0]);
      } catch (error) {
        res.status(500).json(error);
      }
    }
    return res.status(401).json({ message: "Unauthorized" });
};

module.exports = {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
};