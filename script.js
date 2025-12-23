async function trendingStocks(n) {
  if (n === 0) return [];

  const [symbolsRes, marketCapsRes] = await Promise.all([
    fetch("https://api.frontendexpert.io/api/fe/stock-symbols"),
    fetch("https://api.frontendexpert.io/api/fe/stock-market-caps"),
  ]);

  const symbolsData = await symbolsRes.json();
  const marketCapsData = await marketCapsRes.json();

  // symbol -> name
  const symbolToName = {};
  for (const s of symbolsData) {
    symbolToName[s.symbol] = s.name;
  }

  // sort by market cap desc
  const topStocks = marketCapsData
    .sort((a, b) => b["market-cap"] - a["market-cap"])
    .slice(0, n);

  const symbols = topStocks.map(s => s.symbol);

  const pricesRes = await fetch(
    `https://api.frontendexpert.io/api/fe/stock-prices?symbols=${JSON.stringify(symbols)}`
  );
  const pricesData = await pricesRes.json();

  // symbol -> price info
  const symbolToPrice = {};
  for (const p of pricesData) {
    symbolToPrice[p.symbol] = p;
  }

  return topStocks.map(stock => {
    const priceInfo = symbolToPrice[stock.symbol];
    return {
      symbol: stock.symbol,
      name: symbolToName[stock.symbol],
      price: priceInfo.price,
      "52-week-high": priceInfo["52-week-high"],
      "52-week-low": priceInfo["52-week-low"],
      "market-cap": stock["market-cap"],
    };
  });
}
window.trendingStocks = trendingStocks;
