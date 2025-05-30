import redis, { getCachedGithubData } from "@/lib/redis";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    // Check if request has body before parsing
    const text = await req.text();
    if (!text || text.trim() === '') {
      return new Response("Empty request body", { status: 400 });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return new Response("Invalid JSON", { status: 400 });
    }

    // Size limit on free plan 😭
    // await updateEdgeConfig("github", data.data);
    
    // Add null check here
    if (redis && data.data) {
      await redis.set("github", JSON.stringify(data.data));
    }
    
    revalidateTag("github");
    await getCachedGithubData();

    return new Response("Success", { status: 200 });
  } catch (error) {
    console.error("Error in GitHub API:", error);
    return new Response("Error", { status: 500 });
  }
}