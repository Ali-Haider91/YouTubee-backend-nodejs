import mongoose, { Schema } from "mongoose";
import pkg from "jsonwebtoken";
import bcrypt from "bcrypt";

const { jwt } = pkg;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      //remove space
      trim: true,
      // mongoose field to use searching purpose in app to use index
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true, //remove space
    },
    fullName: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    avatar: {
      type: String, //couldinary url
      required: true,
    },
    coverImage: {
      type: String, // cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true,"password is required"]
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

//  monggoose middleware
// to check a password is encrypt from using bcrypt
// and  update password is modified to check
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


// compare password encrypt or decrypt wala password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
          _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
      );
};

export const User = mongoose.model("User", userSchema);
