import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';

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

export async function getStaticPaths() {
  const recipesDirectory = path.join(process.cwd(), 'recipes');
  const filenames = fs.readdirSync(recipesDirectory);
  const paths = filenames.map(filename => ({
    params: { slug: filename.replace(/\.md$/, '') }
  }));
  return {
    paths,
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const recipe = await getRecipe(params.slug);
  return {
    props: {
      recipe,
    },
  };
}

export default function RecipePage({ recipe }) {
  return (
    <div>
      <h1>{recipe.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: recipe.contentHtml }} />
    </div>
  );
}
