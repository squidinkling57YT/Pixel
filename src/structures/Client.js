const { Client: DiscordJSClient } = require('discord.js');
const Constants = require('../utility/Constants.js');
const Database = require('../database/Database.js');
const credentials = require('./../../credentials.json');

class Client extends DiscordJSClient {
  constructor(config) {
    super({
      fetchAllMembers: true,
      disableEveryone: true,
      messageCacheMaxSize: 5,
      messageCacheLifetime: 10,
      messageSweepInterval: 1800,
      disabledEvents: Constants.disabledEvents,
      token: credentials.token
    });

    this.config = config;
    this.db = new Database();
  }

  init() {
    return this.login(credentials.token).catch(err => console.error(err));
  }
}

module.exports = new Client();