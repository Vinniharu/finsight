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

    const { query } = await request.json()

    if (!query) {
      return NextResponse.json(
        { message: 'No query provided' },
        { status: 400 }
      )
    }

    // Execute the query using Prisma
    // Note: This is a simplified example. In a real application,
    // you would want to implement proper SQL query execution
    // and security measures to prevent SQL injection
    const results = await prisma.$queryRawUnsafe(query)

    return NextResponse.json({ results }, { status: 200 })
  } catch (error) {
    console.error('Query execution error:', error)
    return NextResponse.json(
      { message: 'Error executing query' },
      { status: 500 }
    )
  }
} 