import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, email, currentPassword, newPassword } = await request.json()

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // If changing password, verify current password
    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      )

      if (!isPasswordValid) {
        return NextResponse.json(
          { message: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Update user with new password
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          email,
          password: hashedPassword,
        },
      })
    } else {
      // Update user without changing password
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          email,
        },
      })
    }

    return NextResponse.json(
      { message: 'Settings updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { message: 'Error updating settings' },
      { status: 500 }
    )
  }
} 