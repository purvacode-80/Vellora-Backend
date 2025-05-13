const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "Purva@2006";
const client = new OAuth2Client('YOUR_GOOGLE_CLIENT_ID');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Access Denied. No token provided.');
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    // Try verifying with your secret (for local users)
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    // Not your token? Try Google verification
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '779358812935-l8a5em7484oloj5rbieke33qk83cihke.apps.googleusercontent.com',
      });
      const payload = ticket.getPayload();

      req.user = {
        id: payload.sub,
        email: payload.email
      };
      return next();
    } catch (err2) {
      return res.status(400).json({ message: "Invalid token" });
    }
  }
};

module.exports = verifyToken;