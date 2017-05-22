module.exports = {
  importInterval: 3600000,
  mongo: {
    server: 'mongodb',
    port: 27017,
    dbName: 'jobs-aggregator'
  },
  scrapTargets: {
    jobscout: {
      url: 'http://www.jobscout24.ch/de/jobs/?regidl=1-2-3-13-4-5-6-7-8-9-10-11&p=1&ps=100'
    }
  },
  apis: {
		importIo: {
      baseUrl: 'https://api.import.io/store/connector',
			userId: 'f5314fd8-339b-4c2e-9bd5-a903ba866bcd',
			apiKey: 'f5314fd8339b4c2e9bd5a903ba866bcd8ed3dcb882d90fdb89e0730159c00a5ffe9c057511dc75c8a3fcff28730d0736cb524c6bdb10209ac5ef554ea4a32ebc793bc410ed7ca4a89644823e59df1adb',
      extractors: {
        jobscout: '3d4bc7b2-5524-4ead-be6e-e5acd9340f8a'
      }
		}
	}
};
