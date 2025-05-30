import redis, { getCachedGithubData } from "@/lib/redis";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    // Replace this comment with your actual data fetching logic
    const body = await req.json();
    // const data = await fetch('your-github-api-endpoint');
    // const result = await data.json();
    
    // Size limit on free plan 😭
    // await updateEdgeConfig("github", data.data);
    
    // Add null check here
    if (redis) {
      await redis.set("github", JSON.stringify(body)); // or whatever your data variable is
    }
    
    revalidateTag("github");
    await getCachedGithubData();

    return new Response("Success", { status: 200 });
  } catch (error) {
    console.error("Error in GitHub API:", error);
    return new Response("Error", { status: 500 });
  }
}