import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 获取回收站笔记（已删除的笔记）
export async function GET() {
  try {
    // 从数据库查询所有已删除的笔记
    const deletedNotes: any[] = await prisma.note.findMany({
      where: { isDeleted: true },
      orderBy: { updatedAt: "desc" },
      include: {
        notebook: {
          select: {
            id: true,
            title: true,
            coverValue: true,
          },
        },
      },
    });

    return NextResponse.json(deletedNotes);
  } catch (error) {
    console.error("获取回收站失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 恢复笔记（从回收站恢复）
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "缺少笔记ID" }, { status: 400 });

    const restoredNote = await prisma.note.update({
      where: { id },
      data: { isDeleted: false, updatedAt: new Date() },
    });

    return NextResponse.json(restoredNote);
  } catch (error) {
    console.error("恢复笔记失败:", error);
    return NextResponse.json({ error: "恢复失败" }, { status: 500 });
  }
}

// 永久删除笔记（彻底删除）
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "缺少笔记ID" }, { status: 400 });

    await prisma.note.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("永久删除笔记失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}