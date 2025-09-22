import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const instructions = String(form.get("instructions") || "");
  const image = form.get("image");
  if (!image || !(image instanceof File)) {
    return NextResponse.json({ error: "image is required" }, { status: 400 });
  }
  // Mock analysis: produce a simple card component set
  const componentName = "GeneratedCard";
  const files: Record<string, string> = {
    [`src/components/${componentName}/index.tsx`]: `import React from 'react';\nimport styles from './style.module.css';\n\nexport interface ${componentName}Props {\n  title: string;\n  body: string;\n  cta?: string;\n}\n\nexport default function ${componentName}({ title, body, cta }: ${componentName}Props) {\n  return (\n    <div className={styles.card}>\n      <h3 className={styles.title}>{title}</h3>\n      <p className={styles.body}>{body}</p>\n      {cta && <button className={styles.button}>{cta}</button>}\n    </div>\n  );\n}\n`,
    [`src/components/${componentName}/style.module.css`]: `.card{background:#111;border:1px solid #222;border-radius:12px;padding:16px}.title{font-weight:700;margin:0 0 8px}.body{color:#bbb;margin:0 0 12px}.button{background:#2563eb;color:#fff;border:none;border-radius:8px;padding:8px 12px}`,
    [`src/components/${componentName}/${componentName}.stories.tsx`]: `import type { Meta, StoryObj } from '@storybook/react';\nimport ${componentName} from './index';\n\nconst meta: Meta<typeof ${componentName}> = {\n  title: 'Auto/${componentName}',\n  component: ${componentName},\n};\nexport default meta;\n\ntype Story = StoryObj<typeof ${componentName}>;\n\nexport const Basic: Story = {\n  args: { title: 'כותרת', body: 'תוכן כרטיס', cta: 'לחץ כאן' },\n};\n`,
  };
  return NextResponse.json({ files, instructionsLength: instructions.length }, { status: 200 });
}
