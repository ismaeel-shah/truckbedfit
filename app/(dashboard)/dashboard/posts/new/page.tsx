import PostForm from "@/components/dashboard/PostForm";

export const metadata = { title: "New Post" };

export default function NewPostPage() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-primary dark:text-white mb-8">
        New Post
      </h1>
      <PostForm />
    </div>
  );
}
