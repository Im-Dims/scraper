const axios = require('axios')

async function tt(url) {
  let response = await axios.post("https://www.tikwm.com/api", {}, {
    params: {
      url: url,
      count: 12,
      cursor: 0,
      web: 1,
      hd: 1
    }
  });
  return response.data;
}

module.exports = tiktokslide
