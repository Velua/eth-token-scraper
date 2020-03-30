import express from "express";
import cheerio from "cheerio";
import { getHtml } from "./getHtml";

const baseUrl = 'https://etherscan.io'
const app = express();
let tokens = []

const loadTokens = async () => {
    tokens = await fetchTokens(10);
    console.log('Tokens loaded!')
}

app.listen(3001, async () => {
  console.log("Listening on 3001");
  loadTokens()
});

const parseTokenPage = async (pageNumber: number) => {
  const tokens = [];
  const html = await getHtml(`${baseUrl}/tokens?p=${pageNumber}`);
  const $ = cheerio.load(html);
  $(".media").each((index, element) => {
    const image = $(element)
      .find("img")
      .attr("src");
    const label = $(element)
      .find("a")
      .text();
    const contract = $(element)
      .find("a")
      .attr("href")
      .slice(7);
    const splitted = label.split(" ");
    const wrappedSymbol = splitted[splitted.length - 1];
    const name = splitted
      .filter((x, index, arr) => index !== arr.length - 1)
      .join(" ");
    const symbol = wrappedSymbol
      .split("")
      .filter(x => x !== "(" && x !== ")")
      .join("");

    tokens.push({ image: `${baseUrl}${image}`, contract, symbol, name });
  });
  return tokens;
};

const buildNumberedArray = (amount: number) => {
  const numbers = [];
  for (var i = 0; i < amount; i++) {
    numbers.push(i);
  }
  console.log(numbers, "was numbers array");
  return numbers;
};

const fetchTokens = async (pages: number = 10) => {
  const numbers = buildNumberedArray(pages);
  const tokens = await Promise.all(
    numbers.map(number => parseTokenPage(number))
  );
  return tokens.flat(1);
};

app.get("/tokens", async (req, res) => {
  res.json(tokens);
});

app.get('/reload', async(req, res) => {
    const oldTokensLength = tokens.length;
    await loadTokens();
    res.json(`Tokens have been reloaded, had ${oldTokensLength} cached, now cached ${tokens.length}`);
})