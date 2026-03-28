const fs = require('fs');

const urls = [
  { name: 'e95.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzA5Zjc2MzZhZmJjMjRjZDE4NDgzNmM2ZjRiMTRjZTBlEgsSBxDFysfXnhkYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzc3OTcyNDUzMjMwMTg5ODg0NQ&filename=&opi=89354086' },
  { name: 'a49.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzVhODBkMzBkZTc3MDQ1ZDI5NWIxNmNhNDQ4Y2JjN2EwEgsSBxDFysfXnhkYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzc3OTcyNDUzMjMwMTg5ODg0NQ&filename=&opi=89354086' },
  { name: 'd88.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzU3ZDU4MjZjMDRjOTRjMThhOWE0NGQ3ZGEzZGJjMWRkEgsSBxDFysfXnhkYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzc3OTcyNDUzMjMwMTg5ODg0NQ&filename=&opi=89354086' },
  { name: '049.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzQxMGM1MjQ0ODhjYzRhNjI5ODcwOWJjNDE5MGQwYjI5EgsSBxDFysfXnhkYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzc3OTcyNDUzMjMwMTg5ODg0NQ&filename=&opi=89354086' },
];

if (!fs.existsSync('screens_html')) {
  fs.mkdirSync('screens_html');
}

async function run() {
  for (const {name, url} of urls) {
    try {
      const resp = await fetch(url);
      const text = await resp.text();
      fs.writeFileSync(`screens_html/${name}`, text);
      console.log(`Downloaded ${name}`);
    } catch(e) {
      console.error(e);
    }
  }
}
run();
