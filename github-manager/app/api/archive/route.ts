import { NextResponse } from "next/server";

export async function PATCH(req: Request) {

  try {

    const { repo, archived } =
      await req.json();

    const response = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${repo}`,
      {
        method: "PATCH",

        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          archived,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error(data);

      return NextResponse.json(
        {
          success: false,
          error: data,
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });

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