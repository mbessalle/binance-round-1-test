window.onload = async function () {
  const dataPoints = [];
  const chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    zoomEnabled: true,
    theme: "dark2", // "light1", "light2", "dark1", "dark2"
    exportEnabled: true,
    title: {
      text: "BTC/USDT",
    },
    subtitles: [
      {
        text: "minute candles",
      },
    ],
    axisX: {
      interval: 1,
      valueFormatString: "HH:mm",
    },
    axisY: {
      prefix: "$",
      title: "Price",
    },
    toolTip: {
      content:
        "Date: {x}<br /><strong>Price:</strong><br />Open: {y[0]}, Close: {y[3]}<br />High: {y[1]}, Low: {y[2]}",
    },
    data: [
      {
        type: "candlestick",
        risingColor: "green",
        fallingColor: "red",
        yValueFormatString: "$##0.00",
        dataPoints: dataPoints,
      },
    ],
  });

  try {
    const json_data = await (
      await fetch(
        "https://www.binance.com/api/v1/klines?symbol=BTCUSDT&interval=1m"
      )
    ).json();
    const result = json_data.map(([time, open, high, low, close]) => [
      time,
      open,
      high,
      low,
      close,
    ]);
    for (const candle of result) {
      dataPoints.push({
        x: new Date(candle[0]),
        y: [
          parseFloat(candle[1]),
          parseFloat(candle[2]),
          parseFloat(candle[3]),
          parseFloat(candle[4]),
        ],
      });
    }
    console.log("result");
    console.log(result, dataPoints);
    changeBorderColor(chart);
    chart.render();
    
    function changeBorderColor(chart) {
      var dataSeries;
      for (var i = 0; i < chart.options.data.length; i++) {
        dataSeries = chart.options.data[i];
        for (var j = 0; j < dataSeries.dataPoints.length; j++) {
          dataSeries.dataPoints[j].color =
            dataSeries.dataPoints[j].y[0] <= dataSeries.dataPoints[j].y[3]
              ? dataSeries.risingColor
                ? dataSeries.risingColor
                : dataSeries.color
              : dataSeries.fallingColor
              ? dataSeries.fallingColor
              : dataSeries.color;
        }
      }
    }
  } catch (error) {
    console.error(error);
  }

  const updateChart = (candle) => {
    // t is a Date
    // o, h, l, c are floats
    console.log("candle date");
    console.log(candle.t);
    console.log("last date");
    console.log(dataPoints[dataPoints.length - 1].x);
    console.log("==================================");

    if (dataPoints[dataPoints.length - 1].x.getTime() == candle.t.getTime()) {
      console.log("update");
      console.log(dataPoints.length);
      // Update
      dataPoints[dataPoints.length - 1] = {
        x: candle.t,
        y: [candle.o, candle.h, candle.l, candle.c],
      };
    } else {
      console.log("push");
      console.log(dataPoints.length);
      // Push
      dataPoints.push({
        x: candle.t,
        y: [candle.o, candle.h, candle.l, candle.c],
      });
    }
    changeBorderColor();
    chart.render();
    function changeBorderColor() {
      lastCandle = dataPoints[dataPoints.length - 1];
      console.log("lastCandle", lastCandle);
      lastCandle.color = lastCandle.y[0] <= lastCandle.y[3] ? "green" : "red";
      console.log("lastCandle", lastCandle);
    }
  };

  try {
    const socket = new WebSocket(
      "wss://stream.binance.com/stream?streams=btcusdt@kline_1m"
    );
    socket.onmessage = (e) => {
      const res = JSON.parse(e.data);
      let { t, o, h, l, c } = res.data.k;
      t = new Date(t);
      [o, h, l, c] = [o, h, l, c].map(parseFloat);
      updateChart({ t, o, h, l, c });
    };
  } catch (e) {
    console.error(e.message);
  }
};
