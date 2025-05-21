import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { analyzeFinancialData } from '@/lib/gemini'
import * as XLSX from 'xlsx'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      console.error('Unauthorized: No session or email found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check content type to determine how to handle the request
    const contentType = request.headers.get('content-type') || ''
    let data;

    if (contentType.includes('application/json')) {
      // Handle JSON data
      const jsonData = await request.json()
      data = jsonData.data
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('Invalid or empty data provided')
        return NextResponse.json(
          { error: 'Invalid or empty data provided' },
          { status: 400 }
        )
      }
      
      console.log('Processing JSON data:', {
        rowCount: data.length,
        columns: Object.keys(data[0])
      })
    } else {
      // Handle form data with file upload
      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
        console.error('No file provided in request')
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        )
      }

      // Validate file type
      if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        console.error('Invalid file type:', file.name)
        return NextResponse.json(
          { error: 'Invalid file type. Please upload an Excel or CSV file.' },
          { status: 400 }
        )
      }

      // Read file content
      const buffer = await file.arrayBuffer()
      
      try {
        // Parse the Excel data
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        data = XLSX.utils.sheet_to_json(worksheet)

        if (!data || data.length === 0) {
          console.error('No data found in file:', file.name)
          return NextResponse.json(
            { error: 'No data found in the file' },
            { status: 400 }
          )
        }

        console.log('Successfully parsed file data:', {
          fileName: file.name,
          rowCount: data.length,
          columns: Object.keys(data[0])
        })
      } catch (parseError) {
        console.error('Error parsing file:', parseError)
        return NextResponse.json(
          { error: `Error parsing file: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` },
          { status: 400 }
        )
      }
    }

    // At this point, 'data' is available whether from JSON or file upload
    try {
      // Analyze the data using Gemini
      const analysis = await analyzeFinancialData(data)
      console.log('Successfully generated analysis')

      return NextResponse.json(analysis)
    } catch (analysisError) {
      console.error('Error analyzing data:', analysisError)
      return NextResponse.json(
        { error: `Error analyzing data: ${analysisError instanceof Error ? analysisError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in analyze endpoint:', error)
    return NextResponse.json(
      { error: `Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
} 