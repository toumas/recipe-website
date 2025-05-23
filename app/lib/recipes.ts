import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

// This is the version of getRecipes from the subtask prompt
export async function getRecipes() {
  const recipesDirectory = path.join(process.cwd(), 'recipes');
  const filenames = fs.readdirSync(recipesDirectory);

  return filenames.map(filename => {
    const filePath = path.join(recipesDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents); // Use object destructuring for clarity

    let title = data.title; // From frontmatter

    if (!title) { // If no frontmatter title (null, undefined, or empty string according to prompt)
      const firstLine = content.trim().split('\n')[0];
      if (firstLine && firstLine.startsWith('# ')) {
        title = firstLine.substring(2).trim(); // Extract H1 content
      }
    }

    if (!title) { // Fallback to filename if no title from frontmatter or H1
      title = filename.replace(/\.md$/, '');
    }
    
    // Ensure title is not empty string, if so, fallback to filename
    // (this means if title was " " or "" from frontmatter/H1, it becomes filename)
    if (!title.trim()) { 
        title = filename.replace(/\.md$/, '');
    }

    return {
      title,
      slug: filename.replace(/\.md$/, ''),
    };
  });
}
