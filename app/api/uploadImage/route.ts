import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) return new Response("Unauthorized", { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return new Response("No file uploaded", { status: 400 });

    const fileName = `${uuidv4()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type,
      }),
    );

    const url = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${fileName}`;

    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response("Upload failed", { status: 500 });
  }
}
