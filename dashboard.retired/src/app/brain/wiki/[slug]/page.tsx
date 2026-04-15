import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getWikiArticleContent } from "@/lib/state";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WikiArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = getWikiArticleContent(slug);
  if (!content) return notFound();

  // Convert [[wiki-links]] to markdown links before rendering
  const processedContent = content.replace(
    /\[\[([a-z0-9-]+)\]\]/g,
    (_, name: string) => `[${name}](/brain/wiki/${name})`
  );

  return (
    <div className="p-4 lg:p-6 max-w-3xl">
      <Link
        href="/brain"
        className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 mb-6"
      >
        <ChevronLeft className="h-3 w-3" />
        2Brain Intelligence
      </Link>

      <article className="prose prose-slate max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {processedContent}
        </ReactMarkdown>
      </article>
    </div>
  );
}
