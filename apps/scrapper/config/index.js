module.exports = {
  importInterval: 3600000,
  mongo: {
    server: 'mongodb',
    port: 27017,
    dbName: 'test'
  },
  scrapTargets: {
    jobscout: {
      url: 'http://www.jobscout24.ch/de/jobs/?regidl=1-2-3-13-4-5-6-7-8-9-10-11&p=1&ps=100'
    }
  },
  apis: {
		importIo: {
      baseUrl: 'https://api.import.io/store/data',
			userId: 'f5314fd8-339b-4c2e-9bd5-a903ba866bcd',
			apiKey: 'f5314fd8-339b-4c2e-9bd5-a903ba866bcd:jtPcuILZD9uJ4HMBWcAKX/6cBXUR3HXIo/z/KHMNBzbLUkxr2xAgmsXvVU6koy68eTvEEO18pKiWRII+Wd8a2w==',
      extractors: {
        jobscout: '3d4bc7b2-5524-4ead-be6e-e5acd9340f8a'
      }
		}
	}
};
