//Not in current support! if you want a better version of a database just do `npm i quick.db` on the shell.

var db = require("quick.db")
var clientid = "880868490905550909";


module.exports = class BestBotApi {
  get(string, userid) {
    if(string.toLowerCase() == "money") {
    try {
      let money = db.get(`money_${userid}`)
      if(!money) {
        money = 0
      }
      return money;
    } catch(e) {
      console.log(e)
    }
  }
  else if(string.toLowerCase() == "urlprofile") {
    try {
      let profiletag = db.get(`theprofiletag_${userid}`)
      if(!profiletag) {
        return console.log("there is no profile tag registered in this user.")
      }
      else {
      return "https://www.dcbestbot.tk/profile?tag="  + profiletag;
      }
    } catch(e) {
      console.log(e)
    }
  }
  else if(string.toLowerCase() == "rank") {
    try {
      let level = "No VIP"
      let vip = db.get(`vip.${userid}`)
      let vipruby = db.get(`vipruby.${userid}`)
      let vipgod = db.get(`vipgod.${userid}`)
      let developer = db.get(`bestbotdeveloper_${userid}`)
      if(vip === true) {
        level = "VIP"
      }
      else if(vipruby === true) {
        level = "VIP Ruby"
      }
      else if(vipgod === true) {
        level = "VIP God"
      }
      else if(developer === true) {
        level = "Developer"
      }
      return level;
    } catch(e) {
      console.log(e)
    }
  }
  else {
    return 0;
  }
  }
}