export const html = (ip: string) => {
  return `
  <html>
  <head>
    <script>
      const socket = new WebSocket('ws://${ip}:8876');
      socket.onopen = function() {
        console.log('Connected');
        socket.send(
          JSON.stringify({
            event: 'events',
            data: 'test',
          }),
        );
        socket.onmessage = function(data) {
          console.log(data);
          document.body.append(data)
        };
      };
    </script>
  </head>

  <body></body>
</html>
  `;
};
// fs.readFile(
//   path.resolve(__dirname, "../index.html"),
//   "utf-8",
//   function (err, data) {
//     if (err) {
//       console.log("index.html loading is failed :" + err);
//     } else {
//       response.end(data);
//     }
//   }
// );
