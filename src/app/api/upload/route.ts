import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import * as XLSX from 'xlsx'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.error('No session or email found')
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.error('No file provided in form data')
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const fileType = file.name.split('.').pop()?.toLowerCase()
    if (!['xlsx', 'xls', 'csv'].includes(fileType || '')) {
      console.error('Invalid file type:', fileType)
      return NextResponse.json(
        { message: 'Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file.' },
        { status: 400 }
      )
    }

    try {
      // Read file content
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (!jsonData || jsonData.length === 0) {
        console.error('File appears to be empty')
        return NextResponse.json(
          { message: 'File appears to be empty or contains no data' },
          { status: 400 }
        )
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })

      if (!user) {
        console.error('User not found:', session.user.email)
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        )
      }

      console.log('Creating report for user:', user.id)
      
      // Create report
      const report = await prisma.report.create({
        data: {
          title: file.name,
          content: jsonData,
          format: fileType === 'csv' ? 'CSV' : 'EXCEL',
          userId: user.id
        },
      })

      console.log('Report created successfully:', report.id)

      return NextResponse.json({
        message: 'File uploaded successfully',
        reportId: report.id,
      })
    } catch (error) {
      console.error('Error processing file content:', error)
      if (error instanceof Error) {
        return NextResponse.json(
          { message: `Error processing file: ${error.message}` },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { message: 'Error processing file content. Please ensure the file is not corrupted and try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in upload route:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { message: `Error in upload route: ${error.message}` },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { message: 'Error processing file. Please ensure the file is not corrupted and try again.' },
      { status: 500 }
    )
  }
} 