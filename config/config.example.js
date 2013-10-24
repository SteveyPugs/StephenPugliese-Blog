exports.config = {
  hostname: '0.0.0.0',
  port: 8000,
  tls: false
};

exports.mailconfig = {
  method: 'sendmail',
  sendmail: {
    bin: '/usr/sbin/sendmail',
        from: '"Cartography Server" <no-reply@something.com>'
  }
};