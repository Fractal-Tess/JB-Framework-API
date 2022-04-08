const endpoint = 'episodefile'

const param = new URLSearchParams({
  apikey: '5577a7f4a8b9436c9dfc295a8a48f41e',
  seriesId: '5'
})
const url2 = `http://localhost:8989/api/${endpoint}?` + param

const res = await fetch(url2)
const data = await res.text()

const file = await Deno.open('out.json', {
  create: true,
  write: true,
  truncate: true
})
const encoder = new TextEncoder()
file.writeSync(encoder.encode(data))

await Deno.close(file.rid)
