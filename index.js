const needle = require("needle");
const cheerio = require("cheerio");
const TurndownService = require('turndown');


const scrapedResults = [];

async function scrapedHeader() {
  try {
    for (let i=0; i<=2; i++){
      let url = `https://css-tricks.com/archives/page/${i}/`;
      const response = await needle("get", url);

      const $ = cheerio.load(response.body);
      $("article").each((index, element) => {
        let id;
        if (i === 0)
          id = index + 1;
        else
          id = ((i - 1) * 11) + index + 1;

        const resultTitle = $(element)
            .children(".article-article")
            .children("h2");

        const title = resultTitle
            .text()
            .trim();

        const url = resultTitle
            .children("a")
            .attr("href");

        const image = $(element)
            .children(".article-thumbnail-wrap")
            .children("a").children("img")
            .attr("src");

        const author = $(element)
            .find(".author-name")
            .text()
            .trim();

        const resultDate = $(element)
            .find(".author-row > div > time:nth-child(2)")
            .text()
            .trim();
        const date = new Date(resultDate);

        const resultDateUpdate = $(element)
            .find(".author-row > div > time:nth-child(3)")
            .attr("datetime");   
        let dateUpdate;
        if (resultDateUpdate)
          dateUpdate = new Date(resultDateUpdate);

        const tags = [];
        $(element).find("[rel='tag']").each((index, element) => {
          const tag = $(element).text().trim();
          tags.push(tag);
        });
          
        const scrapedResult = { id, title, url, image, author, date, dateUpdate, tags };
        scrapedResults.push(scrapedResult);
      });
    }

    return scrapedResults;
  } catch (error) {
    console.error(error);
  }

}

async function scrapedArticle(articlesHeaders) {
  return await Promise.all(
    articlesHeaders.map(async article => {
      const response = await needle("get", article.url);
      const $ = cheerio.load(response.body);

      const articleHtml = $(".article-content").html();
      const turndownService = new TurndownService();
      const articleContent = turndownService .turndown(articleHtml);
      article.articleContent = articleContent;
      
    })
  );
}

async function main () {
  const articlesHeaders = await scrapedHeader();
  const articlesFullData = await scrapedArticle(articlesHeaders);

  console.log(scrapedResults)
}

main();

