import { get, set, del } from 'idb-keyval';

export const saveImageToDB = async (id: string, file: File): Promise<void> => {
  try {
    await set(id, file);
  } catch (error) {
    console.error('Error saving image to IndexedDB:', error);
  }
};

export const getImageFromDB = async (id: string): Promise<string | null> => {
  try {
    const file = await get<File>(id);
    if (file) {
      return URL.createObjectURL(file);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving image from IndexedDB:', error);
    return null;
  }
};

export const deleteImageFromDB = async (id: string): Promise<void> => {
  try {
    await del(id);
  } catch (error) {
    console.error('Error deleting image from IndexedDB:', error);
  }
};
