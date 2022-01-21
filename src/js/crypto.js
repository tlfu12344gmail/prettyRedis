const crypto = require('crypto');
var Crypto = Crypto || function () {
  return {
    aesEncrypt: function (data, key, iv) {
      let cipherChunks = [];
      let cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
      cipher.setAutoPadding(true);
      cipherChunks.push(cipher.update(data, 'utf8', 'base64'));
      cipherChunks.push(cipher.final('base64'));
      return cipherChunks.join('');
    },
    aesDecrypt: function (data, key, iv) {
      try {
        let cipherChunks = [];
        let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        decipher.setAutoPadding(true);
        cipherChunks.push(decipher.update(data, 'base64', 'utf8'));
        cipherChunks.push(decipher.final('utf8'));
        return cipherChunks.join('');
      }catch (e) {
        return null;
      }


    }
  }
};
module.exports = {
  Crypto: Crypto
}
