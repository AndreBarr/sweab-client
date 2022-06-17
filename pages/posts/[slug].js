import Layout from "../../components/layout";
import Date from "../../components/date";
import Head from "next/head";
import { getAllPostSlugs, getPostDataStrapi } from "../../lib/posts";
import utilStyles from "../../styles/utils.module.css";

export async function getStaticPaths() {
  const strapiPaths = await getAllPostSlugs();
  return {
    paths: strapiPaths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const postData = await getPostDataStrapi(params.slug);
  return {
    props: {
      postData,
    },
  };
}

export default function Post({ postData }) {
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date}></Date>
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </Layout>
  );
}
