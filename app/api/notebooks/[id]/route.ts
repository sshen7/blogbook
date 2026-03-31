import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // 引入真实数据库客户端

// 获取单本笔记本详情 + 关联笔记
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 从数据库查询笔记本 + 关联的笔记
    const notebook = await prisma.notebook.findUnique({
      where: { id: params.id },
      include: {
        notes: {
          orderBy: { order: "asc" }
        },
        _count: {
          select: { notes: true }
        }
      }
    });

    if (!notebook) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    return NextResponse.json(notebook);
  } catch (error) {
    console.error("获取笔记本失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 更新笔记本
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updatedNotebook = await prisma.notebook.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedNotebook);
  } catch (error) {
    console.error("更新笔记本失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// 删除笔记本
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.notebook.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除笔记本失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}