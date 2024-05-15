// @ts-nocheck

import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const blob = await put(`data.jsonl`, request.body, { access: 'public' });
    return NextResponse.json(`${process.env.NEXT_PUBLIC_URL}/api/${blob.url.split(".com/")[1].replace("-", "/")}`);
  } catch (error) {
    console.error('Error storing data:', error);
    return NextResponse.json({ message: 'Error storing data' }, { status: 500 });
  }
}