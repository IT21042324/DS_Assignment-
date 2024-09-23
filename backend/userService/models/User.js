import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const { Schema, Types } = mongoose;

const userSchema = new Schema({
  userName: { type: String, required: true },
  password: { type: String },
  contact: { type: String },
  address: { type: String },
  image: String,
  role: {
    type: String,
    enum: ["Admin", "Buyer", "Merchant"],
    default: "Buyer",
    required: true,
  },
  storeID: { type: Types.ObjectId, ref: "Stores" },
  loginType: {
    type: String,
    enum: ["systemLogin", "googleAuth"],
    default: "systemLogin",
  },
  googleAuthAccessToken: { type: String, default: "" },
});

userSchema.statics.signup = async function (
  userName,
  password,
  contact,
  address,
  image,
  role
) {
  if (!userName || !password || !contact || !address)
    throw Error("Please fill all fields");
  if (!validator.isEmail(userName)) throw Error("Email is invalid");
  if (await this.findOne({ userName, role }))
    throw Error("Email is already in use");

  const hash = await bcrypt.hash(password, 10);
  return this.create({
    userName,
    password: hash,
    contact,
    address,
    image,
    role,
  });
};

userSchema.statics.login = async function (
  userName,
  password,
  role,
  loginType = "systemLogin",
  image,
  googleAuthAccessToken
) {
  if (!userName || (loginType === "systemLogin" && !password))
    throw Error("Please fill all required fields");

  let user = await this.findOne({ userName, role });

  if (!user && loginType === "googleAuth") {
    return this.create({
      userName,
      image: image || "",
      role,
      loginType,
      googleAuthAccessToken: googleAuthAccessToken || "",
    });
  }

  if (
    user &&
    loginType === "googleAuth" &&
    user.googleAuthAccessToken !== googleAuthAccessToken
  ) {
    user.googleAuthAccessToken = googleAuthAccessToken;
    await user.save();
  }

  if (
    loginType === "systemLogin" &&
    (!user || !(await bcrypt.compare(password, user.password)))
  ) {
    throw Error(user ? "Incorrect Password" : "User Name doesn't exist");
  }

  return user;
};

export default mongoose.model("User", userSchema);
