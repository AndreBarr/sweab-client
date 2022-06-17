import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { fetchAPI } from "./api";

const postsDirectory = path.join(process.cwd(), "posts");

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, "");

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...matterResult.data,
    };
  });
  // Sort posts by date
  return allPostsData.sort(({ date: a }, { date: b }) => {
    if (a < b) {
      return 1;
    } else if (a > b) {
      return -1;
    } else {
      return 0;
    }
  });
}

export async function getPostsDataStrapi() {
  // TODO: Better way to handle cms errors
  try {
    const data = await fetchAPI(`/articles`);
    return data.data.map((post) => {
      return {
        id: post.id,
        title: post.attributes.title,
        slug: post.attributes.slug,
        date: post.attributes.publishedAt,
      };
    });
  } catch (err) {
    return null;
  }
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
      },
    };
  });
}

export async function getAllPostSlugs() {
  const data = await fetchAPI("/articles");

  return data.data.map((article) => {
    return {
      params: {
        slug: `${article.attributes.slug}`,
      },
    };
  });
}

export async function getPostDataStrapi(id) {
  const data = await fetchAPI(`/articles/${id}`);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(data.data.attributes.content);
  const contentHtml = processedContent.toString();

  return {
    id,
    contentHtml,
    title: data.data.attributes.title,
    date: data.data.attributes.publishedAt,
  };
}

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id
  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}
