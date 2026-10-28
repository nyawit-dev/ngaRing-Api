const easterEggResponse = (request) => {
  const woofStart = Date.now();
  const body = [
    'Woof! Woof!',
    '',
    '       __',
    '   (___()\'`;',
    '   /,    /`',
    '   \\\\"--\\\\',
    '',
    '⚡ NgaRingApi executed your request at light speed.'
  ].join('\n');
  const buffer = Buffer.from(body, 'utf-8');
  return {
    status: 200,
    statusText: 'Ring Connected!',
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'x-engine': 'ngaringapi',
      'x-fetched-by': 'ngaringapi'
    },
    data: body,
    dataBuffer: buffer.toString('base64'),
    size: buffer.byteLength,
    duration: Date.now() - woofStart,
    url: request.url,
    timeline: [],
    requestSent: {
      url: request.url,
      method: 'WOOF',
      headers: request.headers,
      data: null,
      timestamp: woofStart
    }
  };
};

module.exports = { easterEggResponse };
