import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, query, description } = await request.json()

    if (!name || !query) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const savedQuery = await prisma.savedQuery.create({
      data: {
        name,
        query,
        description,
        userId: session.user.id,
      },
    })

    return NextResponse.json(savedQuery, { status: 201 })
  } catch (error) {
    console.error('Save query error:', error)
    return NextResponse.json(
      { message: 'Error saving query' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const savedQueries = await prisma.savedQuery.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(savedQueries, { status: 200 })
  } catch (error) {
    console.error('Get queries error:', error)
    return NextResponse.json(
      { message: 'Error fetching queries' },
      { status: 500 }
    )
  }
} 