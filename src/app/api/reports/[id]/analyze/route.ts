import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { analyzeFinancialData } from '@/lib/gemini'
import * as XLSX from 'xlsx'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const report = await prisma.report.findUnique({
      where: {
        id: params.id,
        userId: (await prisma.user.findUnique({
          where: { email: session.user.email },
        }))?.id,
      },
    })

    if (!report) {
      return new NextResponse('Report not found', { status: 404 })
    }

    // Parse the Excel data
    const workbook = XLSX.read(report.content, { type: 'buffer' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)

    // Analyze the data using Gemini
    const analysis = await analyzeFinancialData(data)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing report:', error)
    return new NextResponse(
      'Internal Server Error',
      { status: 500 }
    )
  }
} 