import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const { oldName, newName } = await req.json();

  const response = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${oldName}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
      }),
    }
  );

  const data = await response.json();

  return NextResponse.json(data);
}