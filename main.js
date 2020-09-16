const fs = require('fs');
const { parse } = require('url');
const { extname } = require('path');

const cheerio = require('cheerio');
const fetch = require('isomorphic-fetch');
const tmp = require('tmp');
const wallpaper = require('wallpaper');

const createTmpFile = postfix => tmp.fileSync({ postfix });

const parseForImgSrc = html => {
  const parsed = cheerio.load(html);
  const body = parsed('body');

  const firstPost = body.find('#posts').first().find('a.post')
  const imgUrl = 'https://archillect.com' + firstPost.attr('href');
  const firstImage = firstPost.find('img.thumb');
  const thumbSrc = firstImage.attr('src');

  const imgSrc = thumbSrc.slice(0, -7) + '1280' + thumbSrc.slice(-4);

  console.log(`fetching ${imgUrl}`);

  return imgSrc;
};

const writeImgToTmp = ({ url, body }) => {
  return new Promise((resolve, reject) => {
    const postfix = extname(parse(url).pathname);
    const { name } = createTmpFile(postfix);
    const file = fs.createWriteStream(name);

    body.pipe(file);

    file.on('finish', () => {
      resolve(name);
    });
    file.on('error', reject);
  });
};

module.exports = () =>
  fetch('https://archillect.com/')
    .then(res => res.text())
    .then(parseForImgSrc)
    .then(fetch)
    .then(writeImgToTmp)
    .then(wallpaper.set)
    .then(() => {
      console.log('done');
    })
    .catch(err => console.error(err));
