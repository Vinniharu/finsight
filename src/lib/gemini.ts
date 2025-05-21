import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error('GOOGLE_AI_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter'
  title: string
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string[]
      borderColor?: string
      fill?: boolean
    }[]
  }
  options?: {
    [key: string]: any
  }
}

export interface AnalysisResult {
  summary: string
  keyMetrics: {
    name: string
    value: number
    change?: number
    trend?: 'up' | 'down' | 'stable'
  }[]
  insights: string[]
  recommendations: string[]
  charts: ChartConfig[]
  rawData: {
    categories: string[]
    values: number[]
  }[]
}

// Create default analysis structure for fallback
function createDefaultAnalysis(data: any[]): AnalysisResult {
  // Extract column names for labels
  const columns = Object.keys(data[0]);
  const numericColumns = columns.filter(col => {
    return typeof data[0][col] === 'number' || !isNaN(Number(data[0][col]));
  });
  
  // Create a default chart with first numeric column
  const defaultChart: ChartConfig = {
    type: 'bar',
    title: 'Data Overview',
    data: {
      labels: data.map((_, i) => `Entry ${i+1}`).slice(0, 10),
      datasets: [{
        label: numericColumns[0] || 'Values',
        data: data.map(row => Number(row[numericColumns[0]] || 0)).slice(0, 10),
        backgroundColor: ['#4361EE', '#3A0CA3', '#7209B7', '#F72585', '#4CC9F0', 
                         '#4895EF', '#560BAD', '#B5179E', '#F15BB5', '#FEE440']
      }]
    }
  };
  
  return {
    summary: "This is an automated analysis of the provided data.",
    keyMetrics: [
      {
        name: "Data Points",
        value: data.length,
        trend: "stable"
      }
    ],
    insights: ["The data contains " + data.length + " entries"],
    recommendations: ["Review the data for more detailed insights"],
    charts: [defaultChart],
    rawData: [{
      categories: columns,
      values: data.map(row => Object.values(row as Record<string, any>).reduce((sum: number, val: any) => 
        typeof val === 'number' ? sum + val : sum, 0) / Object.values(row).length)
    }]
  };
}

export async function analyzeFinancialData(data: any[]): Promise<AnalysisResult> {
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('No data provided for analysis')
  }

  try {
    console.log('Analyzing data with Gemini API...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    // Limit data size to prevent token limit issues
    const sampleData = data.length > 50 ? data.slice(0, 50) : data;
    
    // Prepare the data for analysis
    const dataStr = JSON.stringify(sampleData, null, 2)
    
    const prompt = `Analyze the following financial data and provide a comprehensive breakdown:
    ${dataStr}

    Please provide:
    1. A summary of the data
    2. Key metrics and their trends
    3. Important insights
    4. Actionable recommendations
    5. Chart configurations for visualizing the data (provide at least 2-3 different chart types)
    6. Raw data arrays for custom visualizations

    Format the response as a JSON object with the following structure:
    {
      "summary": "string",
      "keyMetrics": [
        {
          "name": "string",
          "value": number,
          "change": number,
          "trend": "up|down|stable"
        }
      ],
      "insights": ["string"],
      "recommendations": ["string"],
      "charts": [
        {
          "type": "bar|line|pie|scatter",
          "title": "string",
          "data": {
            "labels": ["string"],
            "datasets": [
              {
                "label": "string",
                "data": [number],
                "backgroundColor": ["string"],
                "borderColor": "string",
                "fill": boolean
              }
            ]
          }
        }
      ],
      "rawData": [{
        "categories": ["string"],
        "values": [number]
      }]
    }

    Ensure charts use appropriate visualization types for the data.
    IMPORTANT: The response should be valid parseable JSON with no markdown formatting.`

    try {
      console.log('Sending request to Gemini API...');
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      console.log('Received response from Gemini API.');
      
      try {
        // Look for JSON in the response
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        const jsonStr = text.substring(jsonStart, jsonEnd);
        
        const analysis = JSON.parse(jsonStr) as AnalysisResult;
        
        // Validate analysis structure
        if (!analysis.summary || !analysis.keyMetrics || !analysis.insights || 
            !analysis.recommendations || !analysis.charts) {
          console.warn('Incomplete analysis structure, using partial results with defaults');
          const defaultAnalysis = createDefaultAnalysis(data);
          
          // Merge with defaults
          return {
            summary: analysis.summary || defaultAnalysis.summary,
            keyMetrics: analysis.keyMetrics || defaultAnalysis.keyMetrics,
            insights: analysis.insights || defaultAnalysis.insights,
            recommendations: analysis.recommendations || defaultAnalysis.recommendations,
            charts: analysis.charts || defaultAnalysis.charts,
            rawData: analysis.rawData || defaultAnalysis.rawData
          };
        }
        
        return analysis;
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.log('AI response text:', text.substring(0, 300) + '...');
        
        // Fall back to default analysis
        console.log('Using fallback analysis');
        return createDefaultAnalysis(data);
      }
    } catch (apiError) {
      console.error('Gemini API error:', apiError);
      throw new Error(`Gemini API error: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error in analyzeFinancialData:', error);
    throw new Error(`Failed to analyze financial data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 