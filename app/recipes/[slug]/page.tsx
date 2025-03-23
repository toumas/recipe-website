import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

async function getRecipe(slug: string) {
  const recipesDirectory = path.join(process.cwd(), 'recipes');
  const filePath = path.join(recipesDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml,
    title: matterResult.data.title || slug,
  };
}

export async function generateStaticParams() {
  const recipesDirectory = path.join(process.cwd(), 'recipes');
  const filenames = fs.readdirSync(recipesDirectory);
  return filenames.map(filename => ({
    slug: filename.replace(/\.md$/, '')
  }));
}

export default async function RecipePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const recipe = await getRecipe(params.slug);
  return (
    <main dangerouslySetInnerHTML={{ __html: recipe.contentHtml }} />
  );
}
