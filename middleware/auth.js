//Inspiré du projet ivocationelle
const jwt = require("jsonwebtoken");

const verifyTokenUser = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token)
    return res.status(403).send("A token is required for authentication");

  // Vérifiez si le token est dans la liste noire
  if (isTokenBlacklisted(token)) {
    return res.status(401).send("Token invalide, veuillez vous reconnecter");
  }

  // Vérification du token
  const result = verifyToken(token);
  if (result === -1) {
    return res.status(403).send("A token is required for authentication");
  }
  if (result === -2) {
    return res
      .status(401)
      .send("Invalid User Bearer Token, please login again");
  }

  // Stocker l'information de l'utilisateur dans req pour y accéder dans la route
  req.user = tokenAnduser.user;
  return next();
};

const verifyTokenAdmin = (req, res, next) => {
  console.log("verifyAdminToken");
  var tokenAnduser = { token: req.headers["authorization"] };
  const result = verifyToken(tokenAnduser);

  if (result === -1) {
    return res.status(403).send("A token is required for authentication");
  }
  if (result === -2) {
    return res
      .status(401)
      .send("Invalid User Bearer Token, please login again");
  }

  // Vérifier si c'est un administrateur
  if (tokenAnduser.user.type !== "admin") {
    return res.status(401).send("Invalid Token, must be administrator");
  }

  // Stocker l'information de l'utilisateur dans req
  req.user = tokenAnduser.user;
  return next();
};

//-1 : No Token found
//-2 : Invalid Token
// 0 : Good Token
function verifyToken(tokenAnduser) {
  if (!tokenAnduser.token) return -1;
  try {
    const bearer = tokenAnduser.token.split(" ");
    if (bearer.length !== 2) return -2;

    const bearerToken = bearer[1];
    const decoded = jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET);

    // Extraire les informations utilisateur du token décodé
    if (decoded.userData) {
      // Nouveau format
      tokenAnduser.user = decoded.userData;
    } else if (decoded.email && typeof decoded.email === "object") {
      // Format actuel (compatibilité)
      tokenAnduser.user = {
        id: decoded.email.id,
        email: decoded.email.email,
        type: decoded.email.type,
      };
    } else {
      console.error("Invalid token structure");
      return -2;
    }
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return -2;
  }
  return 0;
}

module.exports = {
  verifyTokenUser,
  verifyTokenAdmin,
  verifyToken,
};
