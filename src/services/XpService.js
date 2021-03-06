const utility = require('../utility');
const levels = utility.Constants.levels;

class XpService {
  constructor() {
    this.messages = new Map();
  }

  async giveXp(msg) {
    const lastMessage = this.messages.get(msg.author.id);
    const isMessageCooldownOver = lastMessage === undefined || Date.now() - lastMessage > utility.Constants.xp.messageCooldown;
    const isLongEnough = msg.content.length >= utility.Constants.xp.minCharLength;
    const neededXp = await this.getNeededXp(msg.dbUser);

    if (neededXp === 'max level') {
      return;
    }

    if (isMessageCooldownOver && isLongEnough) {
      this.messages.set(msg.author.id, Date.now());
      if (msg.dbUser.xp + utility.Constants.xp.xpPerMessage > neededXp) {
        const newDbUser = await msg.client.db.userRepo.modifyLevel(msg.dbGuild, msg.member, 1);
        await msg.client.db.userRepo.modifySkillPoints(msg.dbGuild, msg.member, 2);
        await utility.Text.createEmbed(msg.author, utility.String.boldify(msg.author.tag) + ', Congratulations, you\'ve ' + (newDbUser.level === 20 ? 'achieved the maximum level we currently have' : 'advanced to level ' + newDbUser.level) + '!');
      }

      return msg.client.db.userRepo.modifyXP(msg.dbGuild, msg.member, utility.Constants.xp.xpPerMessage);
    }
  }

  async giveGlobalXp(msg) {
    const globalLastMessage = this.messages.get(msg.author.id);
    const globalIsMessageCooldownOver = globalLastMessage === undefined || Date.now() - globalLastMessage > utility.Constants.xp.globalMessageCooldown;
    const globalIsLongEnough = msg.content.length >= utility.Constants.xp.globalMinCharLength;
    const globalNeededXp = await this.getGlobalNeededXp(msg.globalDbUser);

    if (globalNeededXp === 'max level') {
      return;
    }

    if (globalIsMessageCooldownOver && globalIsLongEnough) {
      this.messages.set(msg.author.id, Date.now());
      if (msg.globalDbUser.xp + utility.Constants.xp.globalXpPerMessage > globalNeededXp) {
        const newGlobalDbUser = await msg.client.db.globalUserRepo.modifyLevel(msg.member, 1);
        await utility.Text.createEmbed(msg.channel, utility.String.boldify(msg.author.tag) + ', Congrats you\'ve ' + (newGlobalDbUser.level === 20 ? 'achieved the max global level we currently have' : 'advanced to level ' + newGlobalDbUser.level) + '!');
      }

      return msg.client.db.globalUserRepo.modifyXP(msg.member, utility.Constants.xp.globalXpPerMessage);
    }
  }

  async getNeededXp(dbUser) {
    const newUserLevel = dbUser.level + 1;

    for (const key in levels) {
      if (levels.hasOwnProperty(key) === true) {
        const newLevel = levels[key];
        if (newLevel.level === newUserLevel) {
          return newLevel.xpRequired;
        }
      }
    }

    return 'max level';
  }

  async getGlobalNeededXp(globalDbUser) {
    const newGlobalUserLevel = globalDbUser.level + 1;

    for (const key in levels) {
      if (levels.hasOwnProperty(key) === true) {
        const newGlobalLevel = levels[key];
        if (newGlobalLevel.level === newGlobalUserLevel) {
          return newGlobalLevel.xpRequired;
        }
      }
    }

    return 'max level';
  }
}

module.exports = new XpService();
