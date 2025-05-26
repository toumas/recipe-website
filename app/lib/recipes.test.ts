import { getRecipes } from './recipes'; // Import from the refactored location
import fs from 'fs';
import path from 'path';

jest.mock('fs');
jest.mock('path');

describe('getRecipes from app/lib/recipes.ts (Subtask Specific Version)', () => {
  const mockRecipesDirectory = '/mock/recipes';
  const mockCwd = '/mock';

  beforeEach(() => {
    (fs.readdirSync as jest.Mock).mockReset();
    (fs.readFileSync as jest.Mock).mockReset();
    (path.join as jest.Mock).mockReset();

    jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);

    (path.join as jest.Mock).mockImplementation((...args: string[]) => {
      return args.map(arg => arg.replace(/^\/|\/$/g, '')).filter(Boolean).join('/');
    });

    // The first call to path.join in getRecipes is for recipesDirectory
    (path.join as jest.Mock).mockReturnValueOnce(mockRecipesDirectory);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Test Case 1: Recipe with title in frontmatter', async () => {
    const mockFilename = 'frontmatter-title.md';
    const fileContent = `---
title: Frontmatter Title
---
# Some H1
Content`;
    (fs.readdirSync as jest.Mock).mockReturnValue([mockFilename]);
    (fs.readFileSync as jest.Mock).mockReturnValue(fileContent);
    (path.join as jest.Mock).mockReturnValueOnce(path.join(mockRecipesDirectory, mockFilename));

    const recipes = await getRecipes();
    expect(recipes).toHaveLength(1);
    expect(recipes[0].title).toBe('Frontmatter Title');
    expect(recipes[0].slug).toBe('frontmatter-title');
  });

  test('Test Case 2: Recipe with H1 heading but no frontmatter title', async () => {
    const mockFilename = 'h1-title.md';
    const fileContent = `# H1 Title
More content`; // No frontmatter
    (fs.readdirSync as jest.Mock).mockReturnValue([mockFilename]);
    (fs.readFileSync as jest.Mock).mockReturnValue(fileContent);
    (path.join as jest.Mock).mockReturnValueOnce(path.join(mockRecipesDirectory, mockFilename));

    const recipes = await getRecipes();
    expect(recipes).toHaveLength(1);
    expect(recipes[0].title).toBe('H1 Title');
    expect(recipes[0].slug).toBe('h1-title');
  });

  test('Test Case 3: Recipe with no frontmatter title and no H1 heading (falls back to filename)', async () => {
    const mockFilename = 'no-title-recipe.md';
    const fileContent = `Just some plain text content.`;
    (fs.readdirSync as jest.Mock).mockReturnValue([mockFilename]);
    (fs.readFileSync as jest.Mock).mockReturnValue(fileContent);
    (path.join as jest.Mock).mockReturnValueOnce(path.join(mockRecipesDirectory, mockFilename));

    const recipes = await getRecipes();
    expect(recipes).toHaveLength(1);
    expect(recipes[0].title).toBe('no-title-recipe');
    expect(recipes[0].slug).toBe('no-title-recipe');
  });

  test('Test Case 4: Recipe with an empty/whitespace H1 heading (falls back to filename)', async () => {
    const mockFilename = 'empty-h1-recipe.md';
    const fileContent = `#    
More content`;
    (fs.readdirSync as jest.Mock).mockReturnValue([mockFilename]);
    (fs.readFileSync as jest.Mock).mockReturnValue(fileContent);
    (path.join as jest.Mock).mockReturnValueOnce(path.join(mockRecipesDirectory, mockFilename));

    const recipes = await getRecipes();
    expect(recipes).toHaveLength(1);
    expect(recipes[0].title).toBe('empty-h1-recipe');
    expect(recipes[0].slug).toBe('empty-h1-recipe');
  });

  describe('Test Case 5: Recipe with frontmatter title that is an empty string', () => {
    test('falls back to H1 when frontmatter title is empty string and H1 exists', async () => {
      const mockFilename = 'empty-frontmatter-title-h1-fallback.md';
      const fileContent = `---
title: ""
---
# H1 Fallback
Content`;
      (fs.readdirSync as jest.Mock).mockReturnValue([mockFilename]);
      (fs.readFileSync as jest.Mock).mockReturnValue(fileContent);
      (path.join as jest.Mock).mockReturnValueOnce(path.join(mockRecipesDirectory, mockFilename));

      const recipes = await getRecipes();
      expect(recipes).toHaveLength(1);
      expect(recipes[0].title).toBe('H1 Fallback');
      expect(recipes[0].slug).toBe('empty-frontmatter-title-h1-fallback');
    });

    test('falls back to filename when frontmatter title is empty string and no H1 (or empty H1)', async () => {
      const mockFilename = 'empty-fm-title-no-h1.md';
      const fileContent = `---
title: ""
---
Just text`; // No H1
      (fs.readdirSync as jest.Mock).mockReturnValue([mockFilename]);
      (fs.readFileSync as jest.Mock).mockReturnValue(fileContent);
      (path.join as jest.Mock).mockReturnValueOnce(path.join(mockRecipesDirectory, mockFilename));

      const recipes = await getRecipes();
      expect(recipes).toHaveLength(1);
      expect(recipes[0].title).toBe('empty-fm-title-no-h1');
      expect(recipes[0].slug).toBe('empty-fm-title-no-h1');
    });

    test('falls back to filename when frontmatter title is empty string and H1 is also empty/whitespace', async () => {
        const mockFilename = 'empty-fm-empty-h1.md';
        const fileContent = `---
title: ""
---
#      
Just text`; // Empty H1
        (fs.readdirSync as jest.Mock).mockReturnValue([mockFilename]);
        (fs.readFileSync as jest.Mock).mockReturnValue(fileContent);
        (path.join as jest.Mock).mockReturnValueOnce(path.join(mockRecipesDirectory, mockFilename));
  
        const recipes = await getRecipes();
        expect(recipes).toHaveLength(1);
        expect(recipes[0].title).toBe('empty-fm-empty-h1');
        expect(recipes[0].slug).toBe('empty-fm-empty-h1');
      });
  });
});
