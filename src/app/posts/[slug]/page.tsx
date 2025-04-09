import { getPost } from "@/app/posts/actionts";
import Post from "@/components/post";
import { Post as TPost } from "@/lib/db/schema";

type Params = Promise<{ slug: TPost['slug'] }>

export default async function PostPage({
  params,
}: {
  params: Params;
}) {

  const { slug } = await params

    const post = await getPost(slug);

    return (
        <Post 
            post={post.post}
            author={post.author}
        />
    )
}