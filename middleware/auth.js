//Inspiré du projet ivocationelle
const jwt = require("jsonwebtoken");

const verifyTokenUser = (req, res, next) => {
  console.log("verifyToken");
  var tokenAnduser = { token: req.headers["authorization"] };
  switch (verifyToken(tokenAnduser)) {
    case -1: // No Token found
      return res.status(403).send("A token is required for authentication");
    case -2: // Invalid Token
      return res
        .status(401)
        .send("Invalid User Bearer Token, please login again");
    default: //Good Token
      email = tokenAnduser.email;
      type = tokenAnduser.type;
      return next();
  }
};

const verifyTokenAdmin = (req, res, next) => {
  console.log("verifyAdminToken");
  var tokenAnduser = { token: req.headers["authorization"] };
  switch (verifyToken(tokenAnduser)) {
    case -1: // No Token found
      return res.status(403).send("A token is required for authentication");
    case -2: // Invalid Token
      return res
        .status(401)
        .send("Invalid User Bearer Token, please login again");
    default: //Good Token
      //But check if it is of type admin
      if (tokenAnduser.email.type != "admin")
        return res.status(401).send("Invalid Token, must be adminstrator");
      email = tokenAnduser.email;
      type = tokenAnduser.type;

      return next();
  }
};

//-1 : No Token found
//-2 : Invalid Token
// 0 : Good Token
function verifyToken(tokenAnduser) {
  if (!tokenAnduser.token) return -1;
  try {
    const bearer = tokenAnduser.token.split(" ");
    const bearerToken = bearer[1];

    const decoded = jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET);

    tokenAnduser.email = decoded.email;
    tokenAnduser.type = decoded.type;
  } catch (err) {
    return -2;
  }
  return 0;
}

//module.exports = verifyToken, verifyTokenAdmin;
module.exports = {
  verifyTokenUser,
  verifyTokenAdmin,
  verifyToken,
};
