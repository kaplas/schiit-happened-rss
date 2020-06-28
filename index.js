const $ = require('cheerio');
const fetch = require('node-fetch');

const firstPageUrl = 'https://www.head-fi.org/threads/schiit-happened-the-story-of-the-worlds-most-improbable-start-up.701900/';
const firstPostNumber = 10194517;
const firstPostTitle = 'Hey all';

const postSelector = postId => `div[data-lb-id="post-${postId}"]`;

async function getPost(url, postId, title) {
  const res = await fetch(url);
  const html = await res.text();
  const el = $(postSelector(postId), html);
  return {
    el,
    url,
    postId,
    title,
    html: el.html(),
  }
}

async function main() {
  const firstPost = await getPost(firstPageUrl, firstPostNumber, firstPostTitle);

  const links = $(`a[href^="${firstPageUrl}page"]`, firstPost.html)
    .map(function() {
      const url = $(this).attr('href');
      const postId = url.match(/\d+$/)[0];
      const title = $(this).text();
      return { url, postId, title };
    })
    .get();

  const otherPosts = await Promise.all(links.map(link => getPost(link.url, link.postId, link.title)));
  const allPosts = [firstPost].concat(otherPosts);

  return allPosts;
}

main();