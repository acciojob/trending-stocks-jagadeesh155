async function trendingStocks(n) {
  if (n === 0) return [];

  // Fetch symbols & market caps in parallel
  const [symbolsRes, marketCapsRes] = await Promise.all([
    fetch("https://api.frontendexpert.io/api/fe/stock-symbols"),
    fetch("https://api.frontendexpert.io/api/fe/stock-market-caps"),
  ]);

  const symbolsData = await symbolsRes.json();
  const marketCapsData = await marketCapsRes.json();

  // Map symbol -> name
  const symbolToName = new Map();
  for (const stock of symbolsData) {
    symbolToName.set(stock.symbol, stock.name);
  }

  // Sort by market cap descending and take top n
  const topStocks = marketCapsData
    .sort((a, b) => b["market-cap"] - a["market-cap"])
    .slice(0, n);

  const symbols = topStocks.map(s => s.symbol);

  // Fetch prices for only top n symbols
  const pricesRes = await fetch(
    `https://api.frontendexpert.io/api/fe/stock-prices?symbols=${JSON.stringify(symbols)}`
  );
  const pricesData = await pricesRes.json();

  // Map symbol -> price data
  const symbolToPrice = new Map();
  for (const stock of pricesData) {
    symbolToPrice.set(stock.symbol, stock);
  }

  // Build final result
  return topStocks.map(stock => {
    const priceInfo = symbolToPrice.get(stock.symbol);

    return {
      name: symbolToName.get(stock.symbol),
      symbol: stock.symbol,
      price: priceInfo.price,
      "market-cap": stock["market-cap"],
      "52-week-high": priceInfo["52-week-high"],
      "52-week-low": priceInfo["52-week-low"],
    };
  });
}
