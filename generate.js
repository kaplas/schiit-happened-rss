const $ = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { Feed } = require('feed');

const firstPageUrl = 'https://www.head-fi.org/threads/schiit-happened-the-story-of-the-worlds-most-improbable-start-up.701900/';
const firstPostNumber = 10194517;
const firstPostTitle = 'Introduction';

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

async function getAllPosts() {
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
  return [firstPost].concat(otherPosts);
}

function defineNewSchiitFeed() {
  return new Feed({
    title: "Schiit Happened: The Story of the World’s Most Improbable Start-Up",
    language: "en",
    updated: new Date(2013, 6, 14), // optional, default = today
    author: {
      name: "Jason Stoddard",
      link: "https://www.head-fi.org/members/jason-stoddard.153898/"
    }
  });
}

async function getSchiitFeed() {
  const posts = await getAllPosts();
  const schiitFeed = defineNewSchiitFeed();
  posts.forEach(post => {
    schiitFeed.addItem({
      title: post.title,
      id: post.url,
      link: post.url,
      content: post.html,
      author: [schiitFeed.options.author],
      date: post.date,
    });
  });
  return schiitFeed;
}

async function writeAllSchiitFeeds() {
  const schiitFeed = await getSchiitFeed();
  fs.writeFileSync(path.join(__dirname, '/build/feed.rss'), schiitFeed.rss2());
  //fs.writeFileSync(path.join(__dirname, '/build/feed.atom'), schiitFeed.atom1());
  fs.writeFileSync(path.join(__dirname, '/build/feed.json'), schiitFeed.json1());
}

writeAllSchiitFeeds();