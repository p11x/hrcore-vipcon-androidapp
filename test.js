fetch("https://cloud.google.com/run/docs/troubleshooting")
  .then(res => res.text())
  .then(text => {
    const match = text.match(/container failed to start(.*?)(<h2|id=")/is);
    console.log(match ? match[0].replace(/<[^>]+>/g, " ").substring(0, 1000) : "not found");
  })
