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
  const imageContainer = body.find('#container img').first();
  const linkContainer = body.find('#container a').first();
  const imgUrl = 'http://archillect.com/' + linkContainer.text().trim();
  const thumbSrc = imageContainer.attr('src');
  const imgSrc = thumbSrc.slice(0, -8) + '1280' + thumbSrc.slice(-4);
  const img = {
    imgUrl,
    thumbSrc,
    imgSrc
  };

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
  fetch('http://archillect.com/')
    .then(res => res.text())
    .then(parseForImgSrc)
    .then(fetch)
    .then(writeImgToTmp)
    .then(wallpaper.set)
    .then(() => {
      console.log('done');
    })
    .catch(err => console.error);
