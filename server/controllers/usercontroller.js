import userModel from "../models/usemodel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import razorpay from "razorpay";
import transactionModel from "../models/transactionmodels.js";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing details" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.jwt_secret);

    res.json({ success: true, token, user: { name: user.name } });
  } catch (error) {
    console.error("Error:", error);
    res.json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.jwt_secret);

      res.json({ success: true, token, user: { name: user.name } });
    } else {
      return res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.json({ success: false, message: error.message });
  }
};

const userCredits = async (req, res) => {
  try {
    const userId = req.userId;
    //You should not trust anything sent from req.body.userId or req.query.userId, because it can be spoofed.

    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      credits: user.creditBalance,
      user: {
        name: user.name,
      },
    });
  } catch (error) {
    console.log("Error" + error);
    return res.json({ success: false, message: error.message });
  }
};

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentRazorpay = async (req, res) => {
  try {
    const userId = req.userId; // ✅ Get from middleware
    const { planId } = req.body;

    if (!userId || !planId) {
      return res.json({
        success: false,
        message: "Missing details while payment",
      });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    let credits, plan, amount;
    switch (planId) {
      case "Basic":
        plan = "Basic";
        credits = 100;
        amount = 10;
        break;
      case "Advanced":
        plan = "Advanced";
        credits = 500;
        amount = 50;
        break;
      case "Buisness": // fixed typo: Buisness → Business
        plan = "Buisness";
        credits = 5000;
        amount = 250;
        break;
      default:
        return res.json({ success: false, message: "Plan not found" });
    }

    const date = Date.now();
    const transactionData = { userId, plan, amount, credits, date };
    const newTransaction = await transactionModel.create(transactionData);

    const options = {
      amount: amount * 100,
      currency: process.env.CURRENCY || "INR",
      receipt: newTransaction._id.toString(),
    };

    const order = await razorpayInstance.orders.create(options);

    return res.json({ success: true, order });
  } catch (error) {
    console.error("Payment Error:", error);
    return res.json({ success: false, message: error.message });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      const transactionData = await transactionModel.findById(
        orderInfo.receipt
      );
      if (transactionData.payment) {
        return res.json({ success: false, message: "Payment failed" });
      }

      const userData = await userModel.findById(transactionData.userId);
      const creditBalance = userData.creditBalance + transactionData.credits;
      await userModel.findByIdAndUpdate(userData._id, { creditBalance });

      await transactionModel.findByIdAndUpdate(transactionData._id, {
        payment: true,
      });
      res.json({ success: true, message: "Credits added" });
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { registerUser, loginUser, userCredits, paymentRazorpay,verifyRazorpay };

//export default { registerUser, loginUser };
//if u used export default then
//import userController from "../controllers/usercontroller.js";
//const { registerUser, loginUser } = userController;
