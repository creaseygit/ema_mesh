const fs = require('fs');
const readline = require('readline');

const INPUT = 'btcusd_1-min_data.csv';
const OUTPUT = 'btc_data.json';
const TAIL_ROWS = 2880; // ~2 days of 1-min candles

async function extract() {
  const stream = fs.createReadStream(INPUT, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  const buffer = [];
  let isHeader = true;

  for await (const line of rl) {
    if (isHeader) { isHeader = false; continue; }
    buffer.push(line);
    if (buffer.length > TAIL_ROWS) buffer.shift();
  }

  const rows = buffer.map(line => {
    const [ts, open, high, low, close, volume] = line.split(',').map(Number);
    return { t: ts * 1000, o: open, h: high, l: low, c: close, v: volume };
  });

  fs.writeFileSync(OUTPUT, JSON.stringify(rows));
  console.log(`Wrote ${rows.length} rows to ${OUTPUT}`);
}

extract();
