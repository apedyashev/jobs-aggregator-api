/**
 * This library exports first 100 jobs from the 1st page of jobscout24.ch (all regions, all categories)
 * and saves them to DB.
 *
 * Checking of jobs duplication must be performed by DB (link field must be unique). This library only checks
 * if model throws an error with code 11000 or 11001 ('Unique field already exists') and doesn't pass the upper level
 */

require('../../shared/models/Job');
const ImportIo = require('./import.io.js');
const mongoose = require('mongoose');
const async = require('async');
const moment = require('moment');
const Job = mongoose.model('Job');
const {camelizeKeys} = require('humps');
const config = require('../config');

class Scrapper {
  constructor() {
    this.importIo = new ImportIo();
  }

  saveJob(jobData) {
    jobData.date = moment(jobData.date, 'DD.MM.YYYY').format();
    var job = new Job(camelizeKeys(jobData));
    return job.save().catch((err) => {
      if (err && (err.code !== 11000) && (err.code !== 11001)) {
        Promise.reject(err);
      } else {
        // duplicated key is not an error in this case because we just want to avoid duplicating
        // of jobs in database
        Promise.resolve();
      }
    });
  }

  /**
   * Starts import and passes results to callback
   *
   * @param onDone(err, jsonResponse)
   */
  run() {
    const scrapFromUrl = config.scrapTargets.jobscout.url;
    const extractorId = config.apis.importIo.extractors.jobscout;
    return this.importIo.runExtractor(extractorId, scrapFromUrl).then((jsonResponse) => {
      return new Promise((resolve, reject) => {
        // save all the results received from the extractor to DB
        async.each(jsonResponse.results, (jobData, stepDone) => {
          try {
            this.saveJob(jobData).then(() => {
              stepDone();
            }).catch((stepErr) => {
              stepDone(stepErr);
            });
          }
          catch (ex) {
            console.log(ex);
          }
        }, (err) => {
          err ? reject(err) : resolve(jsonResponse.results);
        });
      });
    });
  }
}
module.exports = Scrapper;
