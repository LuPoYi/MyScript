function estimateAPY(tvl, volume7d, feePercentage) {
  const avgDailyVolume = volume7d / 7
  const dailyFeesGenerated = avgDailyVolume * feePercentage;
  const annualFeesGenerated = dailyFeesGenerated * 365;
  const apy = (annualFeesGenerated / tvl) * 100;

  return apy;
}
