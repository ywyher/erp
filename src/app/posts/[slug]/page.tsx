import { getPost } from "@/app/posts/actionts";
import Post from "@/components/post";
import { Post as TPost } from "@/lib/db/schema";

export default async function PostPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
    const post = await getPost(slug);

    return (
        <Post 
            post={post.post}
            author={post.author}
        />
    )
}