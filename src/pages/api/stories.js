import { NextResponse } from 'next/server';

// In-memory storage for stories (replace with database in production)
let stories = [
  {
    id: 1,
    title: "My First Organic Farming Experience",
    content: "Starting organic farming was challenging but rewarding. The transition from conventional to organic methods required patience and learning...",
    author: "Rajesh Kumar",
    date: "2024-03-15"
  },
  {
    id: 2,
    title: "Sustainable Water Management",
    content: "Implementing drip irrigation changed everything. We reduced water usage by 40% while increasing crop yield...",
    author: "Priya Sharma",
    date: "2024-03-10"
  }
];

export async function GET() {
  return NextResponse.json(stories);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newStory = {
      id: stories.length + 1,
      title: body.title,
      content: body.content,
      author: body.author,
      date: new Date().toISOString().split('T')[0]
    };
    
    stories.push(newStory);
    return NextResponse.json(newStory, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    );
  }
} 