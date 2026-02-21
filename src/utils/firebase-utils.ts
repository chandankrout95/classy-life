import { collection, writeBatch, doc } from "firebase/firestore";

export const seedChatsData = async (firestore: any) => {
  const batch = writeBatch(firestore);
  
  const CHATS = Array.from({ length: 15 }).map((_, i) => ({
    username: [
      "amaritsaran",
      "dripsociety.inc",
      "whopphantom",
      "textfae.ree67",
      "iguana.8749135",
      "Pawan Saini",
    ][i % 6],
    img: `https://i.pravatar.cc/150?u=user${i}`,
    lastMsg: [
      "Ooo · Reply?",
      "Sent 10h ago",
      "Active 3h ago",
      "Active 3h ago",
      "Active 4h ago",
      "Seen on Wednesday",
    ][i % 6],
    hasStory: i % 3 === 0,
    createdAt: new Date().toISOString(), // Sorting ke liye zaroori hai
  }));

  CHATS.forEach((chat) => {
    // 'message' collection mein auto-generated ID ke saath push karega
    const docRef = doc(collection(firestore, "message")); 
    batch.set(docRef, chat);
  });

  try {
    await batch.commit();
    console.log("15 Chats successfully pushed to Firestore!");
  } catch (error) {
    console.error("Error pushing bulk data:", error);
  }
};