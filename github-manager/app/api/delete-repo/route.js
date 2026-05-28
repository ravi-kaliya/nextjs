import axios from "axios";

export async function DELETE(req) {
  const { repo } = await req.json();

  await axios.delete(
    `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${repo}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  );

  return Response.json({
    success: true,
  });
}