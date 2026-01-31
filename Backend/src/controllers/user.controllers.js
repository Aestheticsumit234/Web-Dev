import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import {
  sendMail,
  emailVerificationMailGenContent,
  forgotPasswordMailGenContent,
} from "../utils/mails.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, fullname, role } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const user = await User.create({
    username,
    email,
    fullname,
    password,
    role,
  });

  const { unHeshedToken, tokenExpiry } = user.generateVerificationToken();

  user.emailVerificationToken = unHeshedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${process.env.BASE_URL}/api/v1/users/verify-email/${unHeshedToken}`;
  const mailGenContent = emailVerificationMailGenContent(
    username,
    verificationUrl
  );

  await sendMail({
    email: user.email,
    subject: "Verify your email address",
    mailGenContent,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: { username, email, fullname }, verificationUrl },
        "User registered successfully, verification email sent",
        true
      )
    );
});

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return res
      .status(201)
      .json(new ApiResponse(201, "User verified successfully"));
  } catch (error) {
    console.error("Email Verification Error:", error);
    res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
};

export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordMatched(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          },
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(new ApiResponse(400, "please enter email"));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { unHeshedToken, tokenExpiry } = user.generateVerificationToken();

    user.forgotPasswordToken = unHeshedToken;
    user.forgotPasswordTokenExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.BASE_URL}/api/v1/users/reset-password/${unHeshedToken}`;

    const mailGenContent = forgotPasswordMailGenContent(
      user.username,
      resetURL
    );

    await sendMail({
      email: user.email,
      subject: "Reset your password",
      mailGenContent,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, resetURL, "Password reset link sent to your email")
      );
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) throw new ApiError(400, "Reset token is missing");
  if (!password) throw new ApiError(400, "New password is required");

  const user = await User.findOne({
    forgotPasswordToken: token,
    forgotPasswordTokenExpiry: { $gt: new Date() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired reset token");

  user.password = password;

  // Clear token fields
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export const getAdminData = asyncHandler(async (req, res) => {
  const data = {
    admin: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
    serverTime: new Date(),
    message: "This endpoint is accessible only to admins",
  };

  return res.status(200).json(new ApiResponse(200, data, "Admin data fetched"));
});
