import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { featureDescription } = await req.json();
  const slug = (String(featureDescription || "feature").trim() || "feature")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const base = `src/features/${slug}`;
  const files: Record<string, string> = {
    [`${base}/Page.tsx`]: `export default function Page(){return (<div>${slug} page</div>);}`,
    [`${base}/EditModal.tsx`]: `export default function EditModal(){return (<div>edit modal</div>);}`,
    [`${base}/api.ts`]: `export async function save(payload:any){/* mock */ return {ok:true}}`,
    [`${base}/types.ts`]: `export interface ${slug.replace(/-([a-z])/g,(m,p)=>p.toUpperCase())} { id:string }`,
  };
  return NextResponse.json({ files }, { status: 200 });
}

