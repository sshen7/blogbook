import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createNotebookSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  coverType: z.enum(["color", "image", "template"]).default("color"),
  coverValue: z.string().default("#f5f5f5"),
  theme: z.string().default("minimal"),
});

// 创建笔记本
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createNotebookSchema.parse(body);

    const newNotebook = await prisma.notebook.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        coverType: validatedData.coverType,
        coverValue: validatedData.coverValue,
        theme: validatedData.theme,
        sortOrder: 0,
        userId: "1",
        isArchived: false,
      },
      include: {
        _count: { select: { notes: true } },
      },
    });

    return NextResponse.json(newNotebook, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      );
    }

    console.error("创建笔记本失败:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

// 获取所有笔记本
export async function GET(req: NextRequest) {
  try {
    const notebooks = await prisma.notebook.findMany({
      where: { isArchived: false },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { notes: true } },
      },
    });

    return NextResponse.json(notebooks);
  } catch (error) {
    console.error("获取笔记本失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 更新笔记本
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "缺少ID" }, { status: 400 });
    }

    const updatedNotebook = await prisma.notebook.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        _count: { select: { notes: true } },
      },
    });

    return NextResponse.json(updatedNotebook);
  } catch (error) {
    console.error("更新笔记本失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// 删除笔记本
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少ID" }, { status: 400 });
    }

    await prisma.notebook.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除笔记本失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}