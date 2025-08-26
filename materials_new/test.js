function exponentialMovingAverage(data, period) {
    if (data.length < period) {
      throw new Error("Data length must be greater than or equal to the period.");
    }
    const ema = [];
    const alpha = 2 / (period + 1); // 平滑因子
    // 计算第一个 EMA 值（简单平均）
    let sma = 0;
    for (let i = 0; i < period; i++) {
      sma += data[i];
    }
    ema.push(sma / period);
    console.log(JSON.parse(JSON.stringify(ema)))
    // 计算后续的 EMA 值
    for (let i = period; i < data.length; i++) {
      const currentValue = data[i];
      const previousEMA = ema[ema.length - 1];
      const currentEMA = (currentValue - previousEMA) * alpha + previousEMA;
      ema.push(currentEMA);
    }
    return ema;
  }
  
  // 示例数据
  const dailyConsumption = [10, 12, 15, 13, 16, 18, 20, 19, 22, 21,10];
  const period = 3; // EMA 的周期，例如 3 天
  const emaValues = exponentialMovingAverage(dailyConsumption, period);
  
  console.log("原始数据:", dailyConsumption);
  console.log(`EMA (${period} 天):`, emaValues);
  
  // 预测下一天的消耗量（使用最后一个 EMA 值）
  const nextDayPrediction = emaValues[emaValues.length - 1];
  console.log("预测下一天的消耗量:", nextDayPrediction);



  const a = new Promise((resolve) => {
    console.log('1')
    setTimeout(() => {
        resolve(new Promise(_resolve => {
            console.log('2')
            setTimeout(() => {
                _resolve(3)
            }, 2000);
        }))
    }, 2000);
  })
  a.then(res => {
    console.log('3')
  })