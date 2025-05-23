import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

export async function getRecipes() {
  const recipesDirectory = path.join(process.cwd(), 'recipes');
  const filenames = fs.readdirSync(recipesDirectory);

  return filenames.map(filename => {
    const filePath = path.join(recipesDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents); // Use object destructuring

    let title = data.title; // From frontmatter

    // If frontmatter title is missing or an empty string, try H1
    if (!title || title.trim() === "") {
      const firstLine = content.trim().split('\n')[0];
      let h1Title = null;
      if (firstLine && firstLine.startsWith('# ')) {
        h1Title = firstLine.substring(2).trim();
      }

      // If H1 title exists and is not empty, use it
      if (h1Title && h1Title.trim() !== "") {
        title = h1Title;
      } else {
        // If frontmatter title was present but empty, and H1 is also missing/empty,
        // or if frontmatter title was absent and H1 is missing/empty,
        // then fall back to filename.
        title = filename.replace(/\.md$/, '');
      }
    }
    // At this point, if title came from frontmatter and was valid, it's used.
    // If frontmatter title was invalid/missing, and H1 was valid, H1 is used.
    // If both were invalid/missing, filename is used.

    // Final check: if the derived title is somehow still an empty string (e.g. H1 was "#    " and frontmatter was empty)
    // then fallback to filename. This also covers the case where data.title was "" and H1 was also empty.
    if (title.trim() === "") {
        title = filename.replace(/\.md$/, '');
    }

    return {
      title,
      slug: filename.replace(/\.md$/, ''),
    };
  });
}
