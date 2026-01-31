import { ApiResponse } from "../utils/api-response.js";
const helthcheck = (req, res) => {
  try {
    res
      .status(200)
      .json(new ApiResponse(200, { message: "server is running" }));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

export { helthcheck };
