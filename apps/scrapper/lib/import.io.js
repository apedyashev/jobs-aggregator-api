/**
 *  Implements communication with import.io's API
 */

const sprintf = require('sprintf');
const request = require('request');
const config = require('../config');

class ImportIo {
  /**
   * Performs import of the data from importedUrl using import.io's API and extractorId
   *
   * @param extractorId                   - ID of extractor created at www.import.io
   * @param importedUrl                   - url to be imported from
   */
  runExtractor(extractorId, importedUrl) {
    const {userId, apiKey, baseUrl} = config.apis.importIo;
    const url = sprintf('%s/%s/_query?input/webpage/url=%s&_user=%s&_apikey=%s', baseUrl, extractorId,
      encodeURIComponent(importedUrl), userId, encodeURIComponent(apiKey));
    const options = {url};

    return new Promise((resolve, reject) => {
      request(options, (err, response, body) => {
        err ? reject(err) : resolve(JSON.parse(body));
      });
    });
  }
}
module.exports = ImportIo;
