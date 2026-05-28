import { NextResponse } from "next/server";

export async function GET() {

  try {

    let allRepos = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {

      const response = await fetch(
        `https://api.github.com/user/repos?per_page=100&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch repositories");
      }

      const repos = await response.json();

      allRepos = [...allRepos, ...repos];

      hasMore = repos.length === 100;

      page++;
    }

    return NextResponse.json(allRepos);

  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}