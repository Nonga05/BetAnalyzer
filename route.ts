import { NextRequest, NextResponse } from 'next/server'
import { searchMatchAnalysis } from '@/lib/api-football'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || ''
  const match = await searchMatchAnalysis(query)
  return NextResponse.json({ match })
}
