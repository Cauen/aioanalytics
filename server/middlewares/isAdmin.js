var jwt2 = require("jsonwebtoken");
var secret = require("../config/jwt_auth");
let Admin = require("../models/Admin");

var isAdmin = function(req, res, next) {
  if (req.headers && req.headers.authorization) {
    var authorization;
    var decoded;
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      authorization = req.headers.authorization.split(" ")[1];
    } else {
      return res.status(401).send("Without tokens");
    }
    try {
      var decoded = jwt2.verify(authorization, secret);
      console.log(JSON.stringify(decoded));
    } catch (err) {
      console.log(err);
      return res.status(401).send("Invalid token");
    }
    if (decoded)
      Admin.findById(decoded._id, function(err, admin) {
        if (!admin) 
            return res.status("401").send("Admin not found");
        else {
          req.adminid = decoded._id;
          next();
        }
      });
  } else {
      return res.status(401).send('Token not sent');
  }
};

module.exports = isAdmin;
