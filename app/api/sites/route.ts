import { NextResponse } from 'next/server'
import type { Site } from "@/types/site"

let sites: Site[] = [
  {
    id: '1',
    name: 'Netflix',
    description: '영화, TV 프로그램, 다큐멘터리를 제공하는 스트리밍 서비스',
    isSubscribed: true,
    usage: '월 100시간 시청',
    category: '스트리밍',
  },
  {
    id: '2',
    name: 'YouTube Premium',
    description: '광고 없는 동영상 시청, 오프라인 저장, 백그라운드 재생',
    isSubscribed: true,
    usage: '월 50시간 시청',
    category: '스트리밍',
  },
  {
    id: '3',
    name: 'Spotify',
    description: '수백만 곡의 음악과 팟캐스트를 제공하는 오디오 스트리밍 서비스',
    isSubscribed: false,
    usage: '월 30시간 청취',
    category: '오디오',
  },
  {
    id: '4',
    name: 'Adobe Creative Cloud',
    description: '포토샵, 일러스트레이터 등 크리에이티브 앱 모음',
    isSubscribed: true,
    usage: '월 80시간 사용',
    category: '디자인',
  },
  {
    id: '5',
    name: 'Notion',
    description: '메모, 프로젝트 관리, 데이터베이스 기능을 통합한 작업 공간',
    isSubscribed: false,
    usage: '월 40시간 사용',
    category: '생산성',
  },
]

export async function GET() {
  return NextResponse.json(sites)
}

export async function POST(request: Request) {
  const newSite: Site = await request.json()
  newSite.id = String(Date.now()) // Simple ID generation
  sites.push(newSite)
  return NextResponse.json(newSite, { status: 201 })
}

export async function PUT(request: Request) {
  const updatedSite: Site = await request.json()
  sites = sites.map((site) => (site.id === updatedSite.id ? updatedSite : site))
  return NextResponse.json(updatedSite)
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  sites = sites.filter((site) => site.id !== id)
  return NextResponse.json({ message: "Site deleted" })
} 