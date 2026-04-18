import { NextResponse } from "next/server";

export async function GET() {
  const matches = [
    {
      home: "Manchester City",
      away: "Brighton",
      homeProb: 0.68,
      drawProb: 0.20,
      awayProb: 0.12,
      goals: 2.9,
      btts: 0.57
    },
    {
      home: "Real Madrid",
      away: "Valencia",
      homeProb: 0.65,
      drawProb: 0.22,
      awayProb: 0.13,
      goals: 2.7,
      btts: 0.55
    }
  ];

  return NextResponse.json(matches);
}
