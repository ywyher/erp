import { getPost } from "@/app/posts/actionts";
import Header from "@/components/header";
import Post from "@/components/post";
import { Post as TPost } from "@/lib/db/schema";
import type { Metadata } from "next";

type Params = Promise<{ slug: TPost['slug'] }>


// Metadata function — runs before the page loads
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const postData = await getPost(slug);

  if (!postData?.post) {
    return {
      title: "Post Not Found | Perfect Health",
      description: "The requested article does not exist.",
    };
  }

  return {
    title: `${postData.post.title} | Perfect Health`,
    description: postData.post.title,
    openGraph: {
      title: postData.post.title,
      description: postData.post.title,
      url: `https://perfect-health.net/posts/${slug}`,
      siteName: "Perfect Health",
      type: "article",
      authors: [postData.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: postData.post.title,
      description: postData.post.title,
    },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  return (
    <div>
      <Header />
      <Post post={post.post} author={post.author} />
    </div>
  );
}