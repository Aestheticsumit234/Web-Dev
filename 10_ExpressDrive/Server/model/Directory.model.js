import { model, Schema } from "mongoose";

const DirectorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: "Directory",
    },
  },
  {
    timestamps: true,
  },
);

const Directory = model("Directory", DirectorySchema);
export default Directory;
