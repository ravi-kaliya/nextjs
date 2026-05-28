import { NextResponse } from "next/server";

export async function DELETE(req: Request) {

  try {

    const { repo } = await req.json();

    const response = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${repo}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!response.ok) {

      const error = await response.text();

      return NextResponse.json(
        {
          success: false,
          error,
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json({
      success: true,
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