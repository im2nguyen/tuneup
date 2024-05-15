import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  console.log(id)
  const blobUrl = `https://j9twgtdomwgzyyhc.public.blob.vercel-storage.com/data-${id}`;
  console.log(blobUrl)


  https://j9twgtdomwgzyyhc.public.blob.vercel-storage.com/data-1rau7JzahgsN5eVL3yOk9g0t6Of7It.jsonl
  try {
    const response = await fetch(blobUrl);

    if (response.ok) {
      const data = await response.text();
      return new Response(data, { status: 200, headers: { 'Content-Type': 'text/plain' } });
    } else {
      return NextResponse.json({ message: 'Data not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error retrieving data:', error);
    return NextResponse.json({ message: 'Error retrieving data' }, { status: 500 });
  }
}