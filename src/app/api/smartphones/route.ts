import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDirectory = path.join(process.cwd(), 'src/data');
    const fileContents = await fs.readFile(
      path.join(dataDirectory, 'smartphones.json'),
      'utf8'
    );
    const smartphones = JSON.parse(fileContents);

    return NextResponse.json(smartphones);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load smartphones data' },
      { status: 500 }
    );
  }
}
