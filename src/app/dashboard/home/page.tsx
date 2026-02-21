"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Plus,
  X,
  Loader2,
  Camera,
} from "lucide-react";
import Image from "next/image";

// Firebase Imports
import {
  doc,
  setDoc,
  collection,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useFirestore, useUser, storage as firebaseStorage } from "@/firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { updateProfile } from "firebase/auth";
import { UserProfileData } from "@/lib/types";
import { useDashboard } from "../context";
import { useRouter } from "next/navigation";
import PullToRefresh from "react-simple-pull-to-refresh";
import AppleLoader from "@/components/apple-loader";

// --- Fallback Data ---
const DEFAULT_STORIES = [
  {
    id: "s-1",
    username: "whopphantom",
    img: "https://i.pravatar.cc/150?u=phantom",
  },
  {
    id: "s-2",
    username: "dripsociety",
    img: "https://i.pravatar.cc/150?u=drip",
  },
  { id: "s-3", username: "mxrcmuno", img: "https://i.pravatar.cc/150?u=marc" },
];

const DEFAULT_POSTS = [
  {
    id: "p-1",
    username: "marcmunozultimate",
    userImg: "https://i.pravatar.cc/150?u=marc",
    postImg: "https://picsum.photos/seed/car1/600/800",
    likes: "1,240",
    caption: "The dream my brain has on repeat every night 🏎️💨",
    audio: "Original audio",
    time: "2 HOURS AGO",
  },
];

export default function InstagramHomePage() {
  const router = useRouter();
  const { user, auth, loading: authLoading } = useUser();
  const firestore = useFirestore();

  const [localProfile, setLocalProfile] = useState<UserProfileData | null>(
    null,
  );
  const { profile: formData } = useDashboard();

  useEffect(() => {
    if (formData) setLocalProfile(formData);
  }, [formData]);

  // Refs
  const storyImageInputRef = useRef<HTMLInputElement>(null);
  const postImageInputRef = useRef<HTMLInputElement>(null);
  const postUserPicInputRef = useRef<HTMLInputElement>(null);

  // States
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  const [editingPost, setEditingPost] = useState<any>(null);
  const [editingStory, setEditingStory] = useState<any>(null);

  // Form States for Post Editing
  const [editPostUser, setEditPostUser] = useState("");
  const [editPostUserImg, setEditPostUserImg] = useState("");
  const [editPostLikes, setEditPostLikes] = useState("");
  const [editPostCaption, setEditPostCaption] = useState("");
  const [editPostImg, setEditPostImg] = useState("");

  const [editStoryUser, setEditStoryUser] = useState("");
  const [editStoryImg, setEditStoryImg] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);

  // 1. Fetch Data
  const userId = user?.uid || "guest";
  const [dbPosts] = useCollectionData(
    query(
      collection(firestore, `users/${userId}/user_posts`),
      orderBy("createdAt", "desc"),
    ),
  );
  const [dbStories] = useCollectionData(
    query(
      collection(firestore, `users/${userId}/user_stories`),
      orderBy("createdAt", "desc"),
    ),
  );

  const displayPosts =
    dbPosts && dbPosts.length > 0
      ? [
          ...dbPosts,
          ...DEFAULT_POSTS.filter((dp) => !dbPosts.find((p) => p.id === dp.id)),
        ]
      : DEFAULT_POSTS;
  const displayStories =
    dbStories && dbStories.length > 0
      ? [
          ...dbStories,
          ...DEFAULT_STORIES.filter(
            (ds) => !dbStories.find((s) => s.id === ds.id),
          ),
        ]
      : DEFAULT_STORIES;

  // 2. Handle Image Uploads
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    folder: string,
    type: "post" | "user" | "story",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUpdating(true);
    try {
      const imageRef = ref(
        firebaseStorage,
        `${folder}/${userId}/${Date.now()}`,
      );
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      if (type === "post") setEditPostImg(url);
      if (type === "user") setEditPostUserImg(url);
      if (type === "story") setEditStoryImg(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // 3. Save Handlers
  const savePost = async () => {
    if (!editingPost) return;
    setIsUpdating(true);
    try {
      await setDoc(
        doc(firestore, `users/${userId}/user_posts`, editingPost.id.toString()),
        {
          ...editingPost,
          username: editPostUser,
          userImg: editPostUserImg,
          caption: editPostCaption,
          likes: editPostLikes,
          postImg: editPostImg,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
      setIsPostModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const saveStory = async () => {
    if (!editingStory) return;
    setIsUpdating(true);
    try {
      await setDoc(
        doc(
          firestore,
          `users/${userId}/user_stories`,
          editingStory.id.toString(),
        ),
        {
          ...editingStory,
          username: editStoryUser,
          img: editStoryImg,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
      setIsStoryModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      {/* Hidden Inputs */}
      <input
        type="file"
        ref={storyImageInputRef}
        hidden
        onChange={(e) => handleFileUpload(e, "story_images", "story")}
      />
      <input
        type="file"
        ref={postImageInputRef}
        hidden
        onChange={(e) => handleFileUpload(e, "post_images", "post")}
      />
      <input
        type="file"
        ref={postUserPicInputRef}
        hidden
        onChange={(e) => handleFileUpload(e, "post_user_pics", "user")}
      />

      {/* --- Story Edit Modal --- */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm rounded-3xl p-6 border border-border shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">Edit Story</h3>
              <X
                className="cursor-pointer"
                onClick={() => setIsStoryModalOpen(false)}
              />
            </div>
            <div className="space-y-4">
              <div
                className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-primary cursor-pointer group"
                onClick={() => storyImageInputRef.current?.click()}
              >
                <Image
                  src={editStoryImg}
                  alt="story"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" />
                </div>
              </div>
              <input
                value={editStoryUser}
                onChange={(e) => setEditStoryUser(e.target.value)}
                className="w-full bg-secondary p-3 rounded-xl outline-none"
                placeholder="Username"
              />
              <button
                onClick={saveStory}
                disabled={isUpdating}
                className="w-full bg-foreground text-background py-3 rounded-xl font-bold flex justify-center uppercase text-xs tracking-widest active:scale-95 transition-transform"
              >
                {isUpdating ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Save Story"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Post Edit Modal --- */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-sm rounded-3xl p-6 border border-border shadow-xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">Edit Post Details</h3>
              <X
                className="cursor-pointer"
                onClick={() => setIsPostModalOpen(false)}
              />
            </div>
            <div className="space-y-5">
              {/* User Identity Section */}
              <div className="flex items-center gap-4 bg-secondary/50 p-3 rounded-2xl">
                <div
                  className="relative w-16 h-16 rounded-full overflow-hidden cursor-pointer shrink-0"
                  onClick={() => postUserPicInputRef.current?.click()}
                >
                  <Image
                    src={editPostUserImg}
                    alt="user"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Camera className="text-white w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
                    Author Username
                  </label>
                  <input
                    value={editPostUser}
                    onChange={(e) => setEditPostUser(e.target.value)}
                    className="w-full bg-transparent border-b border-border p-1 outline-none text-sm font-bold"
                    placeholder="Username"
                  />
                </div>
              </div>

              {/* Post Image Section */}
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
                  Content Image
                </label>
                <div
                  className="relative aspect-video w-full rounded-xl overflow-hidden cursor-pointer bg-secondary mt-1 group"
                  onClick={() => postImageInputRef.current?.click()}
                >
                  <Image
                    src={editPostImg}
                    alt="post"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  value={editPostLikes}
                  onChange={(e) => setEditPostLikes(e.target.value)}
                  className="w-full bg-secondary p-3 rounded-xl outline-none text-sm"
                  placeholder="Likes (e.g. 1,240)"
                />
                <textarea
                  value={editPostCaption}
                  onChange={(e) => setEditPostCaption(e.target.value)}
                  className="w-full bg-secondary p-3 rounded-xl outline-none text-sm h-20 resize-none"
                  placeholder="Caption"
                />
              </div>

              <button
                onClick={savePost}
                disabled={isUpdating}
                className="w-full bg-foreground text-background py-4 rounded-xl font-bold flex justify-center uppercase text-xs tracking-widest active:scale-95 transition-transform shadow-lg"
              >
                {isUpdating ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  "Update Everything"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Header --- */}
      <header className=" w-full bg-background z-50 px-4 h-14 flex items-center justify-between">
        <Plus className="w-6 h-6" />
        <div className="relative w-24 h-8 dark:invert">
          <Image
            src="/instalogo.png"
            alt="Insta"
            fill
            className="object-contain"
          />
        </div>
        <button onClick={() => router.push("/dashboard/notification")}>
          <Heart className="w-6 h-6" />
        </button>
      </header>

      <main className=" max-w-md mx-auto">
        <PullToRefresh
          onRefresh={() =>
            new Promise((resolve) => setTimeout(resolve, 1000))
          }
          pullingContent={<AppleLoader />}
          refreshingContent={<AppleLoader />}
        >
        {/* --- Stories Section --- */}
        <div className="flex overflow-x-auto py-3 px-3 no-scrollbar border-b border-border bg-background/50">
          {/* --- Your Story (Increased Size) --- */}
          <div className="flex flex-col items-center min-w-[95px] space-y-2 cursor-pointer">
            <div className="relative w-20 h-20 rounded-full p-[2px] border border-border">
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <Image
                  src={
                    localProfile?.avatarUrl ||
                    "https://i.pravatar.cc/150?u=admin"
                  }
                  alt="me"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Plus Icon adjusted for larger circle */}
              <div className="absolute bottom-1 right-1 bg-blue-500 rounded-full border-2 border-background p-1 shadow-md">
                <Plus className="w-3.5 h-3.5 text-white stroke-[3px]" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground font-semibold">
              Your story
            </span>
          </div>

          {/* --- Others' Stories (Decreased Height/Size by 1 level) --- */}
          {displayStories.map((story: any) => (
            <div
              key={story.id}
              className="flex flex-col items-center min-w-[90px] space-y-1 cursor-pointer group"
              onClick={() => {
                setEditingStory(story);
                setEditStoryUser(story.username);
                setEditStoryImg(story.img);
                setIsStoryModalOpen(true);
              }}
            >
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 group-active:scale-95 transition-transform">
                <div className="bg-background p-[2px] rounded-full">
                  {/* FIXED SIZE */}
                  <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden">
                    <Image
                      src={story.img}
                      alt={story.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* FIXED WIDTH */}
              <span className="text-[11px] text-muted-foreground font-medium truncate w-[72px] text-center">
                {story.username}
              </span>
            </div>
          ))}
        </div>
        {/* --- Posts Feed --- */}
        <div className="space-y-2">
          {displayPosts.map((post: any) => (
            <article key={post.id} className="pb-4 bg-background">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border shadow-sm">
                    <Image
                      src={post.userImg}
                      fill
                      alt="u"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold hover:opacity-70 transition-opacity">
                    {post.username}
                  </span>
                </div>
                <MoreHorizontal
                  className="w-5 h-5 cursor-pointer text-muted-foreground"
                  onClick={() => {
                    setEditingPost(post);
                    setEditPostUser(post.username);
                    setEditPostUserImg(post.userImg);
                    setEditPostLikes(post.likes);
                    setEditPostCaption(post.caption);
                    setEditPostImg(post.postImg);
                    setIsPostModalOpen(true);
                  }}
                />
              </div>
              <div className="relative aspect-square w-full bg-muted">
                <Image
                  src={post.postImg}
                  alt="p"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-4">
                  <Heart className="w-6 h-6 hover:text-red-500 transition-colors cursor-pointer" />
                  <MessageCircle className="w-6 h-6 cursor-pointer" />
                  <Send className="w-6 h-6 cursor-pointer" />
                </div>
                <p className="text-sm font-bold">{post.likes} likes</p>
                <p className="text-sm">
                  <span className="font-bold mr-2">{post.username}</span>
                  {post.caption}
                </p>
                {/* {post.createdAt && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-blue-500 font-bold uppercase">
                      Customized
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase">
                      {new Date(
                        post.createdAt.seconds * 1000,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )} */}
              </div>
            </article>
          ))}
        </div>
        </PullToRefresh>
      </main>
    </div>
  );
}
