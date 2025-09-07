import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.headers;

  if (!token)
    return res.json({ success: false, message: "Not Authorised. Login again" });

  try {
    const tokenDecode = jwt.verify(token, process.env.jwt_secret);

    if (tokenDecode.id) {
      req.userId = tokenDecode.id;
    } else {
      return res.json({
        success: false,
        message: "Not Authorised. Login again",
      });
    }

    next(); //First when u hit api url middleware will be execute if evtg is fine then this next() will execute controller fnx.
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default userAuth;
