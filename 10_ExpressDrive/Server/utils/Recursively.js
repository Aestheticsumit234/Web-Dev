import { ObjectId } from "mongodb";
export const getDirectoryContents = async (parentId) => {
  let fileData = await fileCollection
    .find({ parentDirId: parentId }, { projection: { _id: 1, extension: 1 } })
    .toArray();
  let Directories = await dirCollection
    .find({ parentDirId: parentId }, { projection: { _id: 1 } })
    .toArray();
  for (let { _id, name } of Directories) {
    const { fileData: childFile, Directories: childDirectories } =
      await getDirectoryContents(new ObjectId(_id));

    fileData = [...fileData, ...childFile];
    Directories = [...Directories, ...childDirectories];
  }

  return {
    fileData,
    Directories,
  };
};
