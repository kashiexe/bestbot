const Discord = require('discord.js');
require("discord-reply")
const client = new Discord.Client()
const db = require("quick.db")
const moment = require("moment")
const express = require("express")
const app = express()
const DIG = require("discord-image-generation")
const disbut = require("discord-buttons");
disbut(client);
const { MessageButton, MessageMenu, MessageMenuOption } = require("discord-buttons")
const { DiscordMenus, ButtonBuilder, MenuBuilder } = require('discord-menus');
const MenusManager = new DiscordMenus(client);
const QuickChart = require('quickchart-js');
const ms = require("ms")
const got = require('got');
const fetch = require('make-fetch-happen').defaults({
  cachePath: './data' 
})

// const Topgg = require("@top-gg/sdk")
// const webhook = new Topgg.Webhook("your webhook auth")

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/web/home.html")
})

app.get(`/money`, function(req, res) {
  let userid = req.query.userid;
  let money = db.get(`money_${userid}`)
  if(!money) {
    money = 0;
  }
  res.send(`${money}`);
})

app.get("/home", function(req, res) {
  res.sendFile(__dirname + "/web/home.html")
})

app.get("/mb", function(req, res) {
  res.sendFile(__dirname + "/web/mbhome.html")
})

app.get(`/search-profile`, function(req, res) {
  res.sendFile(__dirname + `/web/searchprofile.html`)
})

app.engine('html', require('ejs').renderFile);

app.get(`/leaderboard`, function(req, res) {
  let array = [];
    client.users.cache.forEach(user => {
      array.push(user)
    })

    let allmemberslength = array.length;
    let members = 0;
    let limittoshow = 10;

    let anotherarray = [];

    for(let j = 0; j < allmemberslength; j++) {
      let money = db.fetch(`money_${array[j].id}`)
      
      if(!money || money === null) continue;

      anotherarray.push({ 
        name: array[j].tag, 
        money: money
      })
    }

    let newlb = [];
    anotherarray.sort((a, b) => b.money - a.money)
    for(let a = 0; a < anotherarray.length; a++) {
      members++
      if(members >= limittoshow) continue;
      newlb.push(`${a+1}. ${anotherarray[a].name} - ${anotherarray[a].money}$`)
    }
    let finallb = newlb.join("\n")
    let lbtype = "Global Leaderboard"
  res.render(__dirname + `/web/leaderboard.html`, { lb: finallb, avatar: client.user.displayAvatarURL(), lbtype: lbtype, name: "Global"})
})

app.get(`/leaderboard/:guildid`, function(req, res) {
  let guild = client.guilds.cache.get(req.params.guildid);
  if(!guild) {
    res.send("error")
  }
  else {
  let array = [];
    guild.members.cache.forEach(user => {
      array.push(user)
    })

    let allmemberslength = array.length;
    let members = 0;
    let limittoshow = 10;

    let anotherarray = [];

    for(let j = 0; j < allmemberslength; j++) {
      let money = db.fetch(`money_${array[j].id}`)
      
      if(!money || money === null) continue;

      anotherarray.push({ 
        name: array[j].user.tag, 
        money: money
      })
    }

    let newlb = [];
    anotherarray.sort((a, b) => b.money - a.money)
    for(let a = 0; a < anotherarray.length; a++) {
      members++
      if(members >= limittoshow) continue;
      newlb.push(`${a+1}. ${anotherarray[a].name} - ${anotherarray[a].money}$`)
    }
    let finallb = newlb.join("\n")
    let lbtype = guild.name + "'s Leaderboard";
  res.render(__dirname + `/web/leaderboard.html`, { lb: finallb, avatar: guild.iconURL(), lbtype: lbtype, name: guild.name })
  }
})

app.get(`/search`, function(req, res) {
  let pt = req.query.profiletag;
  let userid = req.query.userid;
  if(!userid) {
  let userid = db.get(`thesearch_${pt}`)
  if(!userid) {
    res.sendFile(__dirname + "/web/pfpnotfound.html")
  }
  else {
  let user = client.users.cache.get(userid)
  if(!user) {
    res.sendFile(__dirname + "/web/pfpnotfound.html")
  }
  else {
  let themoney = db.get(`money_${userid}`)
  if(!themoney) {
    themoney = 0
  }
  let username = user.username
  let useravatar = user.avatarURL({ dynamic: true })
  let userdiscriminator = user.discriminator
  let color = db.get(`color_${userid}`)
  if(!color) {
    color = "#34ebab"
  }
  let aboutme = db.get(`aboutme_${userid}`)
  if(!aboutme) {
    aboutme = "There is no about me yet"
  }
  db.add(`views_${pt}`, 1)
  let views = db.get(`views_${pt}`)
  let famousprofile = db.get(`famousprofile_${userid}`)
  let truefamousprofile = "Famous Profile (1000+ views)"
  if(views >= 1000) {
    if(!famousprofile) {
    db.set(`famousprofile_${userid}`, true)
    db.add(`achievements_${userid}`, 1)
    }
  }
  if(famousprofile === true) {
    famousprofile = "https://cdn.discordapp.com/attachments/880487906748293140/886675212844793887/Famous_profile_2.jpg"
  }
  else if(!famousprofile) {
    famousprofile = "https://cdn.discordapp.com/attachments/880487906748293140/886676079488688248/not_famous_profile_1.jpg"
    truefamousprofile = "Not a famous profile (>1000 views)"
  }
  let vip = db.get(`vip.${userid}`)
        let vipruby = db.get(`vipruby.${userid}`)
        let vipgod = db.get(`vipgod.${userid}`)
        let developercheck = db.get(`bestbotdeveloper_${userid}`)
        let isbot = user.bot
        let emoji = "https://cdn.discordapp.com/emojis/888151792955834378.png?v=1";
        let developer = "https://cdn.discordapp.com/emojis/888158896223563796.png?v=1";
        let vipt = "No VIP"
        let developert = "Not A Developer"
        if(developercheck === true) {
          developer = "https://cdn.discordapp.com/emojis/888150353554587648.png?v=1"
          developert = "Developer"
        }
        if(vip === true) {
          emoji = "https://cdn.discordapp.com/emojis/887808862638456873.png?v=1"
          vipt = "VIP"
        }
        else if(vipruby === true) {
          emoji = "https://cdn.discordapp.com/emojis/887808842770026526.png?v=1"
          vipt = "VIP Ruby"
        }
        else if(vip === true) {
          emoji = "https://cdn.discordapp.com/emojis/887808794271313940.png?v=1"
          vipt = "VIP God"
        }
        else if(isbot) {
          emoji = "https://cdn.discordapp.com/emojis/888153380634120213.png?v=1"
          vipt = "BOT"
        }
  res.render(__dirname + `/web/profile.html`, {money: themoney, tag: pt, username: username, useravatar: useravatar, profilecolor: color, ud: userdiscriminator, aboutme: aboutme, views: views, famousprofile: famousprofile, truefamousprofile: truefamousprofile, emoji: emoji, developer: developer, vipt: vipt, developert: developert })
  }
  }
  }
  else if(!pt) {
  let user = client.users.cache.get(userid)
  if(!user) {
    res.sendFile(__dirname + "/web/pfpnotfound.html")
  }
  else {
  let tag = db.get(`theprofiletag_${userid}`)
  let themoney = db.get(`money_${userid}`)
  if(!themoney) {
    themoney = 0
  }
  let username = user.username
  let useravatar = user.avatarURL({ dynamic: true })
  let userdiscriminator = user.discriminator
  let color = db.get(`color_${userid}`)
  if(!color) {
    color = "#34ebab"
  }
  let aboutme = db.get(`aboutme_${userid}`)
  if(!aboutme) {
    aboutme = "There is no about me yet"
  }
  db.add(`views_${tag}`, 1)
  let views = db.get(`views_${tag}`)
  let famousprofile = db.get(`famousprofile_${userid}`)
  let truefamousprofile = "Famous Profile (1000+ views)"
  if(views >= 1000) {
    if(!famousprofile) {
    db.set(`famousprofile_${userid}`, true)
    db.add(`achievements_${userid}`, 1)
    }
  }
  if(famousprofile === true) {
    famousprofile = "https://cdn.discordapp.com/attachments/880487906748293140/886675212844793887/Famous_profile_2.jpg"
  }
  else if(!famousprofile) {
    famousprofile = "https://cdn.discordapp.com/attachments/880487906748293140/886676079488688248/not_famous_profile_1.jpg"
    truefamousprofile = "Not a famous profile (>1000 views)"
  }
        let vip = db.get(`vip.${userid}`)
        let vipruby = db.get(`vipruby.${userid}`)
        let vipgod = db.get(`vipgod.${userid}`)
        let developercheck = db.get(`bestbotdeveloper_${userid}`)
        let isbot = user.bot
        let emoji = "https://cdn.discordapp.com/emojis/888151792955834378.png?v=1";
        let developer = "https://cdn.discordapp.com/emojis/888158896223563796.png?v=1";
        let vipt = "No VIP"
        let developert = "Not A Developer"
        if(developercheck === true) {
          developer = "https://cdn.discordapp.com/emojis/888150353554587648.png?v=1"
          developert = "Developer"
        }
        if(vip === true) {
          emoji = "https://cdn.discordapp.com/emojis/887808862638456873.png?v=1"
          vipt = "VIP"
        }
        else if(vipruby === true) {
          emoji = "https://cdn.discordapp.com/emojis/887808842770026526.png?v=1"
          vipt = "VIP Ruby"
        }
        else if(vip === true) {
          emoji = "https://cdn.discordapp.com/emojis/887808794271313940.png?v=1"
          vipt = "VIP God"
        }
        else if(isbot) {
          emoji = "https://cdn.discordapp.com/emojis/888153380634120213.png?v=1"
          vipt = "BOT"
        }
  res.render(__dirname + `/web/profile.html`, {money: themoney, tag: tag, username: username, useravatar: useravatar, profilecolor: color, ud: userdiscriminator, aboutme: aboutme, views: views, famousprofile: famousprofile, truefamousprofile: truefamousprofile, emoji: emoji, developer: developer, vipt: vipt, developert: developert })
  }
  }
})

app.get(`/profile`, function(req, res) {
  let pt = req.query.tag;
  let userid = db.get(`thesearch_${pt}`)
  if(!userid) {
    res.sendFile(__dirname + "/web/pfpnotfound.html")
  }
  else {
  let user = client.users.cache.get(userid)
  if(!user) {
    res.sendFile(__dirname + "/web/pfpnotfound.html")
  }
  else {
  let themoney = db.get(`money_${userid}`)
  if(!themoney) {
    themoney = 0
  }
  let username = user.username
  let useravatar = user.avatarURL({ dynamic: true })
  let userdiscriminator = user.discriminator
  let color = db.get(`color_${userid}`)
  if(!color) {
    color = "#34ebab"
  }
  let aboutme = db.get(`aboutme_${userid}`)
  if(!aboutme) {
    aboutme = "There is no about me yet"
  }
  db.add(`views_${pt}`, 1)
  let views = db.get(`views_${pt}`)
  let famousprofile = db.get(`famousprofile_${userid}`)
  let truefamousprofile = "Famous Profile (1000+ views)"
  if(views >= 1000) {
    if(!famousprofile) {
    db.set(`famousprofile_${userid}`, true)
    db.add(`achievements_${userid}`, 1)
    }
  }
  if(famousprofile === true) {
    famousprofile = "https://cdn.discordapp.com/attachments/880487906748293140/886675212844793887/Famous_profile_2.jpg"
  }
  else if(!famousprofile) {
    famousprofile = "https://cdn.discordapp.com/attachments/880487906748293140/886676079488688248/not_famous_profile_1.jpg"
    truefamousprofile = "Not a famous profile (>1000 views)"
  }
        let vip = db.get(`vip.${userid}`)
        let vipruby = db.get(`vipruby.${userid}`)
        let vipgod = db.get(`vipgod.${userid}`)
        let developercheck = db.get(`bestbotdeveloper_${userid}`)
        let isbot = user.bot
        let emoji = "https://cdn.discordapp.com/emojis/888151792955834378.png?v=1";
        let developer = "https://cdn.discordapp.com/emojis/888158896223563796.png?v=1";
        let vipt = "No VIP"
        let developert = "Not A Developer"
        if(developercheck === true) {
          developer = "https://cdn.discordapp.com/emojis/888150353554587648.png?v=1"
          developert = "Developer"
        }
        if(vip === true) {
          emoji = "https://cdn.discordapp.com/emojis/887808862638456873.png?v=1"
          vipt = "VIP"
        }
        else if(vipruby === true) {
          emoji = "https://cdn.discordapp.com/emojis/887808842770026526.png?v=1"
          vipt = "VIP Ruby"
        }
        else if(vip === true) {
          emoji = "https://cdn.discordapp.com/emojis/887808794271313940.png?v=1"
          vipt = "VIP God"
        }
        else if(isbot) {
          emoji = "https://cdn.discordapp.com/emojis/888153380634120213.png?v=1"
          vipt = "BOT"
        }
  res.render(__dirname + `/web/profile.html`, {money: themoney, tag: pt, username: username, useravatar: useravatar, profilecolor: color, ud: userdiscriminator, aboutme: aboutme, views: views, famousprofile: famousprofile, truefamousprofile: truefamousprofile, emoji: emoji, developer: developer, vipt: vipt, developert: developert })
  }
  }
})

app.get(`/terms-of-service`, function(req, res) {
  res.sendFile(__dirname + `/web/terms-of-service.html`)
})

//app.post("/dblwebhook", webhook.listener(vote => {
  // user id "vote.user"
  //db.add(`money_${vote.user}`, 15000)
  //db.add(`10dayvip_${vote.user}`, 1)
  //let vipdate = moment(new Date()).format("x")
  //db.set(`10dayvipdate_${vote.user}`, vipdate)
  //let theuser = client.users.cache.get(vote.user)
  //let embed = new Discord.MessageEmbed()
  //.setTitle(`Thanks for voting on our bot!`)
  //.setDescription(`As a recompensation, we gave you 10 day vip and 15000$! \nThanks for liking our bot and have fun!`)
  //.setColor("GREEN")
  //.setThumbnail(user.displayAvatarURL({ dynamic: true }))
  //.setFooter("vip date in MS: " + vipdate)
  //theuser.send(embed)
//}))

//app.listen(80)

app.listen(3000, function() {
  console.log("working")
  setInterval(function() {
    const fs = require('fs');
    fs.copyFile('json.sqlite', './api/json.sqlite', (err) => {
    if (err) throw err;
  });
  }, 60000)
})

client.on("ready", () => {
  db.set(`bestbotdeveloper_861376659597164545`, true)
  console.log(db.get(`bestbotdeveloper_861376659597164545`))
  console.log(`Best Bot Main Developer - ABigDisappointment#2294`)
  client.user.setActivity(`in some servers`, { type: 'PLAYING' })
})

client.on("message", async message => {
  if(!message.guild) { 
    return 
  }
  let prefix = db.get(`prefix_${message.guild.id}`)
  if(!prefix) {
    prefix = "?"
  }

  if (!message.content.toLowerCase().startsWith(prefix) || message.content.includes('@here') || message.content.includes('@everyone')) {
		return;
  }
  if(message.author.bot && message.author.id ==! "884510089917104128") {
    return
  }

	const args = message.content
		.slice(prefix.length)
		.trim()
		.split(" ");
	const command = args.shift().toLowerCase();

  let profiletag = db.get(`theprofiletag_${message.author.id}`)
  if(!profiletag) {
    let user = message.author
    let count = db.get(`thecount_${client.user.id}`)
    if(!count) {
      count = 1
      db.add(`thecount_${client.user.id}`, 1)
    }
    if(count >= 1) {
      db.add(`thecount_${client.user.id}`, 1)
    }
    db.set(`theprofiletag_${user.id}`, count)
    let profiletag = db.get(`theprofiletag_${user.id}`)
    db.set(`thesearch_${profiletag}`, user.id)
  }
  if(command.toLowerCase() === "ping") {
    let embedpinging = new Discord.MessageEmbed()
    .setTitle(`Pinging...`)
    .setColor("GREEN")
    let embed = new Discord.MessageEmbed()
    .setTitle(`Ping`)
    .setDescription(`:robot: API Ping - ${client.ws.ping}`)
    .setColor("ORANGE")
    .setThumbnail(client.user.displayAvatarURL())
    message.channel.send(embedpinging).then(message => {
      setTimeout(function() {
        message.edit(embed)
      }, client.ws.ping)
    })
  }
  if(command.toLowerCase() === "deleteprofile") {
    let developer = db.get(`bestbotdeveloper_${message.author.id}`)
    if(developer === true) {
    let ptag = args[0]
    let reason = args.slice(1).join(" ")
    if(!reason) {
      reason = "System Bugs"
    }
      let embed = new Discord.MessageEmbed()
      .setTitle(`profile ${ptag} was deleted`)
      .setColor("RED")
      .setDescription(`Type: \nDelete (reasons can be from bugs on the system or break tos level 2)`)
      message.channel.send(embed)
      db.delete(`thesearch_${ptag}`)
    }
    else {
      return
    }
  }
  if(command.toLowerCase() === "beg") {
    let begtrue = db.get(`begtrue_${message.author.id}`)
    if(!begtrue) {
    let money = Math.floor(Math.random() * 1000) + 500;
    let person = [
      "a rich man",
      "a streamer",
      "some useless person",
      "bill gates",
      "rob jobs",
      "probably elon musk",
      "yes",
      "a tiktoker",
      "a programmer (lol, what a useless guy am i right?)",
      "an old man",
      "squidward",
      "a questionable memer",
      "a redditor",
      "a discord mod",
      "a random weird street kid",
      "that weird neighbor",
      "scary guy",
      "rick astley",
    ]
    db.add(`money_${message.author.id}`, money)
    db.set(`begtrue_${message.author.id}`, true)
    db.add(`allmoney_${client.user.id}`, money)
    let embed = new Discord.MessageEmbed()
    .setTitle(`You just got ${money}$ from ${person[Math.floor(Math.random() * person.length)]}`)
    .setColor("GREEN")
    .setThumbnail(`https://cdn.discordapp.com/attachments/880485897026560114/884890964169199656/squidward_chad.jpg`)
    message.channel.send(embed).then(() => {
      setTimeout(function() {
        db.delete(`begtrue_${message.author.id}`)
      }, 300000)
    })
    }
    else {
      return message.channel.send("you already used this command")
    }
  }
  if(command.toLowerCase() === "bal" || command.toLowerCase() === "balance" || command.toLowerCase() === "m" || command.toLowerCase() === "money") {
    let user = message.mentions.users.first()
    if(!user) {
      user = message.author
    }
    let money = db.get(`money_${user.id}`)
    if(!money) {
      money = 0
    }
    let bank = db.get(`bank_${user.id}`)
    if(!bank) {
      bank = 0
    }
    let bbc = db.get(`bbc.${user.id}`);
    if(!bbc) {
      bbc = 0.0000;
    }
    let colors = [
      "ORANGE",
      "RED",
      "YELLOW",
      "GREEN",
      "BLUE"
    ]
    let color = colors[Math.floor(Math.random() * colors.length)]
    let embed = new Discord.MessageEmbed()
    .setTitle(`${user.username}'s balance`)
    .setColor(color)
    .addField(`:briefcase: Money`, `${money}$`, {inline: true})
    .addField(`:bank: Bank`, `${bank}$`, {inline: true})
    .addField(`<:BestBotCoin:884447303954481153> BBC`, `${bbc.toFixed(4)}`)
    .setThumbnail(user.displayAvatarURL({dynamic: true}))
    .setFooter(`${prefix}profile to check your profile!`)
    message.channel.send(embed)
  } 
  if(command.toLowerCase() === "profile" || command.toLowerCase() === "p") {
    let user = message.mentions.users.first()
    if(!args[0] || message.mentions.users.first()) {
      if(!args[0]) {
        user = message.author
      }
      let color = db.get(`color_${user.id}`)
      if(!color) {
        color = "#34ebab"
      }
      let aboutme = db.get(`aboutme_${user.id}`)
      if(!aboutme) {
        aboutme = "There is no about me yet"
      }
      let verifiedprofile = db.get(`theprofiletag_${user.id}`)
      if(!verifiedprofile) {
        let count = db.get(`thecount_${client.user.id}`)
        if(!count) {
          count = 1
          db.add(`thecount_${client.user.id}`, 1)
        }
        if(count >= 1) {
        db.add(`thecount_${client.user.id}`, 1)
        }
        db.set(`theprofiletag_${user.id}`, count)
        let profiletag = db.get(`theprofiletag_${user.id}`)
        db.set(`thesearch_${profiletag}`, user.id)
      }
      let money = db.get(`money_${user.id}`)
      if(!money) {
        money = 0
      }
      let bank = db.get(`bank_${user.id}`)
      if(!bank) {
        bank = 0
      }
      let bbc = db.get(`bbc.${user.id}`);
      if(!bbc) {
        bbc = 0.0000;
      }
        let vip = db.get(`vip.${user.id}`)
        let vipruby = db.get(`vipruby.${user.id}`)
        let vipgod = db.get(`vipgod.${user.id}`)
        let developer = db.get(`bestbotdeveloper_${user.id}`)
        let emoji = "vip";
        if(vip === true) {
          emoji = "<:vip:887808862638456873>"
        }
        else if(vipruby === true) {
          emoji = "<:VIPRuby:887808842770026526>"
        }
        else if(vip === true) {
          emoji = "<:VIPGod:887808794271313940>"
        }
        if(emoji === "vip") {
          emoji = "<:NoVIP:888151792955834378>"
        }
      let profiletagofc = db.get(`theprofiletag_${user.id}`)
        let profile = new Discord.MessageEmbed()
        .setTitle(`${user.username}'s Profile ${emoji}`)
        .setColor(color)
        .setDescription(`${aboutme}`)
        .addField(`:briefcase: Money`, `${money}$`, {inline: true})
        .addField(`:bank: Bank`, `${bank}$`, {inline: true})
        .addField(`<:BestBotCoin:884447303954481153> BBC`, `${bbc.toFixed(4)}`)
        .addField(`<:usernamegenerator:883077034123886633> Profile info`, `**[Profile URL](https://www.dcbestbot.tk/profile?tag=${profiletagofc})** \n**Profile tag: #${profiletagofc}**`)
        .setFooter(`check out our website: https://www.dcbestbot.tk`)
        .setThumbnail(user.displayAvatarURL({dynamic: true}))
        if(developer === true) {
          profile.setTitle(`${user.username}'s Profile ${emoji} <:developer:888150353554587648>`)
        }
        if(user.bot) {
          profile.setTitle(`${user.username}'s Profile <:bot:888153380634120213>`)
        }
        message.channel.send(profile)
    }
    else if(args[0]) {
      let search = db.get(`thesearch_${args[0]}`)
      if(!search) {
        let embed = new Discord.MessageEmbed()
        .setTitle(`Error`)
        .setColor("RED")
        .setDescription(`No found user in this profile tag`)
        message.channel.send(embed)
      }
      else {
        let member = client.users.cache.get(search)
        if(!member) {
        let embed = new Discord.MessageEmbed()
        .setTitle(`Error`)
        .setColor("RED")
        .setDescription(`No found user in this profile tag`)
        message.channel.send(embed)  
        }
        else {
        let money = db.get(`money_${search}`)
        if(!money) {
        money = 0
        }
        let profiletag = db.get(`theprofiletag_${search}`)
        let bank = db.get(`bank_${search}`)
        if(!bank) {
          bank = 0
        }
        let color = db.get(`color_${search}`)
        if(!color) {
          color = "#34ebab"
        }
        let aboutme = db.get(`aboutme_${search}`)
        if(!aboutme) {
          aboutme = "There is no about me yet"
        }
        let bbc = db.get(`bbc.${search}`);
        if(!bbc) {
          bbc = 0.0000;
        }
        let vip = db.get(`vip.${search}`)
        let vipruby = db.get(`vipruby.${search}`)
        let vipgod = db.get(`vipgod.${search}`)
        let developer = db.get(`bestbotdeveloper_${search}`)
        let emoji = "vip";
        if(vip === true) {
          emoji = "<:vip:887808862638456873>"
        }
        else if(vipruby === true) {
          emoji = "<:VIPRuby:887808842770026526>"
        }
        else if(vip === true) {
          emoji = "<:VIPGod:887808794271313940>"
        }
        if(emoji === "vip") {
          emoji = "<:NoVIP:888151792955834378>"
        }
        let embed = new Discord.MessageEmbed()
        .setTitle(`${member.username}'s Profile ${emoji}`)
        .setColor(color)
        .addField(`:briefcase: Money`, `${money}$`, {inline: true})
        .addField(`:bank: Bank`, `${bank}$`, {inline: true})
        .addField(`<:BestBotCoin:884447303954481153> BBC`, `${bbc.toFixed(4)}`)
        .setDescription(`${aboutme}`)
        .addField(`<:usernamegenerator:883077034123886633> Profile info`, `**[Profile URL](https://www.dcbestbot.tk/profile?tag=${profiletag})** \n**Profile tag: #${profiletag}**`)
        .setFooter(`check out our website: https://www.dcbestbot.tk`)
        .setThumbnail(member.displayAvatarURL({dynamic: true}))
        if(developer === true) {
          embed.setTitle(`${member.username}'s Profile ${emoji} <:developer:888150353554587648>`)
        }
        if(member.bot) {
          embed.setTitle(`${member.username}'s Profile <:bot:888153380634120213>`)
        }
        message.channel.send(embed)
      }
      }
    }
  }
  if(command.toLowerCase() === "deposit" || command.toLowerCase() === "dep") {
    let quantity = args[0]
    if(!quantity) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Error`)
      .setColor("RED")
      .setDescription(`You need to define a quantity to deposit.`)
      message.channel.send(embed)
    }
    else {
      let user = message.author
      let money = db.get(`money_${user.id}`)
      if(money < quantity || !money) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Error`)
      .setColor("RED")
      .setDescription(`You do not have enough money to deposit or you tried to deposit an invalid quantity`)
      message.channel.send(embed)
      }
      else {
        if(quantity === "all") {
          quantity = money
        } 
        db.subtract(`money_${user.id}`, quantity)
        db.add(`bank_${user.id}`, quantity)
        let bankk = db.get(`bank_${user.id}`)
        let embed = new Discord.MessageEmbed()
        .setTitle(`Bank`)
        .setDescription(`You have successfully deposit **${quantity}**$\nYou now have ${bankk}$ on your bank`)
        .setColor("GREEN")
        .setThumbnail(`${user.displayAvatarURL({dynamic: true})}`)
        message.channel.send(embed)
      }
    }
  }
  if(command.toLowerCase() === "withdraw" || command.toLowerCase() === "with" || command.toLowerCase() === "draw") {
    let quantity = args[0]
    if(!quantity) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Error`)
      .setColor("RED")
      .setDescription(`You need to define a quantity to withdraw.`)
      message.channel.send(embed)
    }
    else {
      let user = message.author
      let money = db.get(`bank_${user.id}`)
      if(money < quantity || !money) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Error`)
      .setColor("RED")
      .setDescription(`You do not have enough money to withdraw or you tried to withdraw an invalid quantity`)
      message.channel.send(embed)
      }
      else {
        if(quantity === "all") {
          quantity = money
        } 
        db.add(`money_${user.id}`, quantity)
        db.subtract(`bank_${user.id}`, quantity)
        let bankk = db.get(`bank_${user.id}`)
        let embed = new Discord.MessageEmbed()
        .setTitle(`Bank`)
        .setDescription(`You have successfully deposit **${quantity}**$\nYou now have ${bankk}$ on your bank`)
        .setColor("GREEN")
        .setThumbnail(`${user.displayAvatarURL({dynamic: true})}`)
        message.channel.send(embed)
      }
    }
  }
  if(command.toLowerCase() === "redeem") {
    let redeemcode = args[0]
    let redeemcodes = db.get(`redeemcodes1_${client.user.id}_${redeemcode}`)
    if(!redeemcode) {
      let money = db.get(`money_${message.author.id}`)
      if(!money) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Hm...`)
      .setDescription(`As you didn't specify a redeemcode, we will try to find any codes that have not been used for you, wait a couple of seconds...`)
      .setColor("#f53e31")
      message.channel.send(embed).then(message => {
        setTimeout(function() {
          let code = db.get(`acccode1_${message.author.id}`)
          message.edit(`<@${message.author.id}> We found a code for you, please wait a bit`).then(message => {
            setTimeout(function() {
            let embed = new Discord.MessageEmbed()
            .setTitle(`Rewards`)
            .setDescription(`You just won 1000$ from that code!`)
            .setColor("GREEN")
            message.edit(embed)
            db.add(`money_${message.author.id}`, 1000)
            }, 3000)
          })
        }, 2000);
    })
    }
    else {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Redeem code not found`)
      .setColor("RED")
      message.channel.send(embed)
    }
    }
    else if(redeemcodes === true) {
      let redeemed = db.get(`redeemed_${message.author.id}_${redeemcode}`)
      if(!redeemed) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Rewards`)
      .setColor("GREEN")
      .setDescription(`Cool you just received 1000$`)
      message.channel.send(embed)
      db.add(`money_${message.author.id}`, 1000)
      db.set(`redeemed_${message.author.id}_${redeemcode}`, true)
      }
      else {
        let embed = new Discord.MessageEmbed()
        .setTitle(`Redeem code already redeemed`)
        .setColor("RED")
        message.channel.send(embed)
      }
    }
    else {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Redeem code not found`)
      .setColor("RED")
      message.channel.send(embed)
    }
  }
  if(command.toLowerCase() === "create_redeemcode" || command.toLowerCase() === "create_redeemcodes" ||  command.toLowerCase() === "create_rc") {
    if(message.member.id === "861376659597164545") {
    let redeemcode = args[0]
    if(!redeemcode) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Error ID: 02`)
      .setDescription(`no args defined`)
      .setColor("RED")
      .setFooter(`You need to specify a freaking code to create`)
      message.channel.send(embed)
    }
    else {
      db.set(`redeemcodes1_${client.user.id}_${args[0]}`, true)
      let embed = new Discord.MessageEmbed()
      .setTitle(`New redeem code`)
      .setColor("GREEN")
      .setDescription(`\`\`${args[0]}\`\``)
      message.channel.send(embed)
    }
    }
    else {
      return
    }
  }
  if(command.toLowerCase() === "mail") {
    let developer = db.get(`bestbotdeveloper_${message.author.id}`)
    if(developer === true && !args[0] || developer === true && message.mentions.users.first()) {
    let announcementuser = db.get(`au4_${message.author.id}`)
    if(!announcementuser) {
      db.add(`au4_${client.user.id}`, message.author.id)
      db.set(`au4_${message.author.id}`, true)
    }
    let user = message.mentions.users.first()
    if(!user) {
      user = message.author
    }
    let mail = db.get(`${user.id}.mail`)
    let mailcount = db.get(`${user.id}.mailCount`)
    let emoji = `:mailbox:`
    if(!mailcount) {
      mailcount = 0
    }
    let mail1 = "Nothing here"
    if(!mail) {
      mail1 = mail1
    }
    else {
      mail1 = `You have ${mailcount} unread mails  :e_mail:` + `\n\n` + mail.join("\n")
      emoji = `:mailbox_with_mail:`
    }
    let embed = new Discord.MessageEmbed()
    .setTitle(`${user.username}'s Mail ${emoji}`)
    .setDescription(mail1)
    .setColor("ORANGE")
    .setThumbnail(user.displayAvatarURL({dynamic: true}))
    .setFooter(`${prefix}mail clear to clear all || Confirmed Developer Tool`)
    message.channel.send(embed)
    }
    if(!args[0]) {
    if(!developer) {
    let mail = db.get(`${message.author.id}.mail`)
    let mailcount = db.get(`${message.author.id}.mailCount`)
    let emoji = `:mailbox:`
    if(!mailcount) {
      mailcount = 0
    }
    let mail1 = "Nothing here"
    if(!mail) {
      mail1 = mail1
    }
    else {
      mail1 = `You have ${mailcount} unread mails  :e_mail:` + `\n\n` + mail.join("\n")
      emoji = `:mailbox_with_mail:`
    }
    let embed = new Discord.MessageEmbed()
    .setTitle(`Your Mail ${emoji}`)
    .setDescription(mail1)
    .setColor("ORANGE")
    .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
    .setFooter(`${prefix}mail clear to clear all`)
    message.channel.send(embed)
    }
    }
    else if(args[0].toLowerCase() === "clear") {
      let embed = new Discord.MessageEmbed()
      .setTitle(`mail cleared`)
      .setColor("GREEN")
      message.channel.send(embed)
      db.delete(`${message.author.id}.mail`)
      db.delete(`${message.author.id}.mailCount`)
    }
    else if(args[0].toLowerCase() === "2") {
    let limitmailcheck = db.get(`${message.author.id}.mailCount`)
    if(limitmailcheck >= 25) {
    let mail = db.get(`${message.author.id}.mail2`)
    let mailcount = db.get(`${message.author.id}.mailCount`)
    let emoji = `:mailbox:`
    if(!mailcount) {
      mailcount = 0
    }
    let mail1 = "Nothing here"
    if(!mail) {
      mail2 = mail2
    }
    else {
      mail2 = `You have ${mailcount} unread mails  :e_mail:` + `\n\n` + mail.join("\n")
      emoji = `:mailbox_with_mail:`
    }
    let embed = new Discord.MessageEmbed()
    .setTitle(`Your Mail ${emoji} | Page 2`)
    .setDescription(mail2)
    .setColor("ORANGE")
    .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
    .setFooter(`${prefix}mail clear to clear all`)
    message.channel.send(embed)
    } 
    else {
      return
    }
    }
    else if(args[0].toLowerCase() === "send") {
    let user = message.mentions.users.first()
    if(!user && !args[1]) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Error ID: 03 || Error ID: 08`)
      .setDescription(`no user specified || user does not exist`)
      .setColor("RED")
      .setFooter(`you either didn't specify an user or that user just doesn't exist`)
      return message.channel.send(embed)
    }
    else {
      let mail = args.slice(2).join(' ')
      if(mail.length >= 150) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Error ID: 14`)
      .setDescription(`too much information`)
      .setColor("RED")
      .setFooter(`Why does your mail need to be that long, damn`)
      message.channel.send(embed)
      }
      else {
      if(!message.mentions.users.first() && args[1]) {
      let id = db.get(`thesearch_${args[1]}`)
      user = client.users.cache.get(id)
      if(!user) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Error ID: 08`)
      .setDescription(`user does not exist`)
      .setColor("RED")
      .setFooter(`This user doesn't exist! please specify a valid profile tag`)
      return message.channel.send(embed)
      }
      }
      let mailid2 = Math.floor(Math.random() * 250000000)
      let mailid = Math.floor(Math.random() * 250000000) + mailid2 + 100000000;
      if(!mail) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Error ID: 02`)
      .setDescription(`no args defined`)
      .setColor("RED")
      .setFooter(`don't forget to add an actuall mail to send`)
      message.channel.send(embed)
      }
      else {
      let maillength = db.get(`${user.id}.mailCount`)
      if(!maillength) {
        maillength = 0
      }
      if(maillength >= 25) {
        db.push(`${user.id}.mail2`, `${message.author.username} (${mailid}) - ${mail}`)
        db.set(`${client.user.id}.mailData_${mailid}`, `${message.author.tag} (Mail sent to ${user.tag} / ${user.id}) - ${mail}`)
        db.add(`${user.id}.mailCount`, 1)
        let embed = new Discord.MessageEmbed()
        .setTitle(`Mail successfully sent!`)
        .setColor("GREEN")
        message.channel.send(embed)
      }
      else {
        let embed = new Discord.MessageEmbed()
        .setTitle(`Mail successfully sent!`)
        .setColor("GREEN")
        message.channel.send(embed)
        db.push(`${user.id}.mail`, `${message.author.username} (${mailid}) - ${mail}`)
        db.add(`${user.id}.mailCount`, 1)
        db.set(`${client.user.id}.mailData_${mailid}`, `${message.author.tag} (Mail sent to ${user.tag} / ${user.id}) - ${mail}`)
      }
      }
    }
    }
    }
    else if(args[0].toLowerCase() === "read") {
      let developer = db.get(`bestbotdeveloper_${message.author.id}`)
      if(developer === true) {
        let mailid = args[1]
        let mail = db.get(`${client.user.id}.mailData_${mailid}`)
        if(!mail) {
          message.channel.send("No mail was found with this id!")
        }
        else {
          let embed = new Discord.MessageEmbed()
          .setTitle(`Mail #${mailid}`)
          .setDescription(`${mail}`)
          .setColor("GREEN")
          message.channel.send(embed)
        }
      }
      else {
        return
      }
    }
  }
  if(command.toLowerCase() === "announce") {
    let announcement = args.slice(0).join(' ')
    if(!announcement) {
      announcement = "Test Announcement"
    }
    let developer = db.get(`bestbotdeveloper_${message.author.id}`)
    if(developer === true) {
    let guilds = client.guilds.cache.array();

  for (let i = 0; i < guilds.length; i++) {
    client.guilds.cache.get(guilds[i].id).members.fetch().then(r => {
      r.array().forEach(r => {
        let maillimit = db.get(`${r.user.id}.mailCount`)
        if(maillimit >= 25) {
        db.push(`${r.user.id}.mail2`, `**Bot Announcement: ${announcement}**`)
        db.add(`${r.user.id}.mailCount`, 1)
        }
        else {
        db.push(`${r.user.id}.mail`, `**Bot Announcement: ${announcement}**`)
        db.add(`${r.user.id}.mailCount`, 1)
        }
      });
    });
  }
    let embed = new Discord.MessageEmbed()
    .setTitle(`Announcement`)
    .setDescription(`${announcement}`)
    .setColor("PURPLE")
    .setThumbnail(client.user.displayAvatarURL({ dynamic: true}))
    message.channel.send(embed)
    client.channels.cache.find(c => c.id === "881239178107576361").send(embed)
    }
    else {
      return
    }
  }
  if(command.toLowerCase() === "versionupdate" || command.toLowerCase() === "update_version" || command.toLowerCase() === "versionup" || command.toLowerCase() === "updateversion") {
    let version = args[0]
    if(!version) {
      let versionfromclient = db.get(`version_${client.user.id}`)
      if(!versionfromclient) {
        versionfromclient = "1.0.0"
      }
      version = versionfromclient
    }
    let whatchanged = args.slice(1).join(" ")
    if(!whatchanged) {
      whatchanged = "Updated version"
    }
    let developer = db.get(`bestbotdeveloper_${message.author.id}`)
    if(developer === true) {
    let guilds = client.guilds.cache.array();

  for (let i = 0; i < guilds.length; i++) {
    client.guilds.cache.get(guilds[i].id).members.fetch().then(r => {
      r.array().forEach(r => {
        let maillimit = db.get(`${r.user.id}.mailCount`)
        if(maillimit >= 25) {
        db.push(`${r.user.id}.mail2`, `**Bot Update** - New version: ${version} \n What changed: ${whatchanged}`)
        db.add(`${r.user.id}.mailCount`, 1)
        }
        else {
        db.push(`${r.user.id}.mail`, `**Bot Update** - New version: ${version} \n What changed: ${whatchanged}`)
        db.add(`${r.user.id}.mailCount`, 1)
        }
      });
    });
  }
    let embed = new Discord.MessageEmbed()
    .setTitle(`New version!`)
    .setDescription(`**Version:** __${version}__ \n**What changed?** __${whatchanged}__`)
    .setColor("PURPLE")
    .setThumbnail(client.user.displayAvatarURL({ dynamic: true}))
    message.channel.send(embed)
    client.channels.cache.find(c => c.id === "881239178107576361").send(embed)
    }
    else {
      return
    }
  }
  if(command.toLowerCase() === "settings" || command.toLowerCase() === "setting" || command.toLowerCase() === "set") {
    if(!args[0]) {
    let emojina = `:green_square:`
    let na = db.get(`noannouncement_${message.author.id}`)
    if(na === true) {
      emojina = `:red_square:`
    }
    let embed = new Discord.MessageEmbed()
    .setTitle(`:gear: All Settings`)
    .setDescription(`User Settings \n\n**Mail Announcements** (you get mails about recent bot announcements):  ${emojina}`)
    .setColor("#4a4a4a")
    message.channel.send(embed)
  }
  else if(args[0].toLowerCase() === "profile_setcolor" || args[0].toLowerCase() === "p_setcolor") {
    let color = args[1]
    if(!color || !color.includes("#")) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Error ID: 02 || Error ID: 09`)
      .setDescription(`no args defined || text type invalid`)
      .setColor("RED")
      .setFooter(`Make sure you use hex or rgb code as your color!`)
      message.channel.send(embed)
    }
    else {
      db.set(`color_${message.author.id}`, color)
      let profiletag = db.get(`theprofiletag_${message.author.id}`)
      let embed = new Discord.MessageEmbed()
      .setTitle(`New Profile Color`)
      .setDescription(`Profile color, see how the profile looks by doing \`?p\` or going to your profile url: https://www.dcbestbot.tk/profile?tag=${profiletag}`)
      .setColor(color)
      message.channel.send(embed)
    }
  }
  else if(args[0].toLowerCase() === "aboutme") {
    let newaboutme = args.slice(1).join(" ")
    if(!newaboutme) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Error ID: 02`)
      .setDescription(`no args defined`)
      .setColor("RED")
      .setFooter(`Don't forget your actuall new about me!`)
      message.channel.send(embed)
    }
    else {
      db.set(`aboutme_${message.author.id}`, newaboutme)
      let embed = new Discord.MessageEmbed()
        .setTitle(`New About me!`)
        .setDescription(`${newaboutme}`)
        .setColor("GREEN")
        message.channel.send(embed)
    }
  }
  }
  if(command.toLowerCase() === "trash") {
    let user = message.mentions.users.first()
    if(!user) {
      user = message.author
    }
    let avatar = user.displayAvatarURL({ dynamic: false, format: "png"})
    let trash = await new DIG.Delete().getImage(avatar);
    let trashimage = new Discord.MessageAttachment(trash, "delete.png")
    message.channel.send(trashimage)
  }
  if(command.toLowerCase() === "test") {
    message.channel.send("ok!")
  }
  if(command.toLowerCase() === "testbutton") {
    let button = new MessageButton()
    .setLabel("Click me!")
    .setStyle("url")
    .setURL("https://www.dcbestbot.tk")
    message.channel.send("This is a test button for future development purposes!", button)
  }
  if(command.toLowerCase() === "help") {
    let embed = new Discord.MessageEmbed()
    .setTitle(`Help!`)
    .setDescription(`Please choose one of the sections on the menu above to specific command info`)
    .setColor("GREEN")
    .setThumbnail(message.guild.iconURL())
    let myOnlyCoolMenu = new MenuBuilder()
    .addLabel('Moderation', {
        description: 'All of the moderation commands', value: 'Moderation', emoji: {
            name: '🛠️'
        }
    })
    .addLabel('Economy', {
        description: 'All of the economy command info', value: 'Economy', emoji: {
            name: '🏦'
        }
    })
    .addLabel('Fun commands', {
        description: 'Fun commands i guess', value: 'Fun', emoji: {
            name: '🎮'
        }
    })
    .addLabel('Others', {
        description: 'Other stuff', value: 'Others', emoji: {
            name: '🌌'
        }
    })
    .setMaxValues(1)
    .setMinValues(1)
    .setCustomID('TheMenuID')
    .setPlaceHolder('Select a category');
    await MenusManager.sendMenu(message, embed, { menu: myOnlyCoolMenu })
  }
  if(command.toLowerCase() === "goals") {
    if(!args[0]) {
      let goals = db.get(`goals_${client.user.id}`)
      if(!goals) {
        goals = "no goals set yet"
      }
      else {
        goals = goals.join("\n")
      }
      let embed = new Discord.MessageEmbed()
      .setTitle(`Goals`)
      .setDescription(goals)
      .setColor("GREEN")
      message.channel.send(embed)
    }
    else if(args[0].toLowerCase() === "set") {
      let developer = db.get(`bestbotdeveloper_${message.author.id}`)
      if(developer === true) {
        let newgoal = args.slice(1).join(" ")
        if(!newgoal) {
          let embed = new Discord.MessageEmbed()
          .setTitle(`Error ID: 02`)
          .setDescription(`no args defined`)
          .setFooter(`don't forget to set a new goal!`)
          .setColor("GREEN")
          message.channel.send(embed)
        }
        else {
          db.push(`goals_${client.user.id}`, newgoal)
          let embed = new Discord.MessageEmbed()
          .setTitle(`New goal`)
          .setDescription(newgoal)
          .setColor("GREEN")
          .setThumbnail(client.user.displayAvatarURL())
          message.channel.send(embed)
        }
      }
      else {
        message.channel.send("You don't have permission to use this command")
      }
    }
    else if(args[0].toLowerCase() === "reset") {
      let developer = db.get(`bestbotdeveloper_${message.author.id}`)
      if(developer === true) {
        db.delete(`goals_${client.user.id}`)
        message.channel.send("Deleted all the goals!")
      }
      else {
        message.channel.send("You don't have permission to use this command")
      }
    }
  }
  if(command.toLowerCase() === "level") {
    let user = message.mentions.users.first()
    if(!user) {
      user = message.author
    }
    let level = db.get(`level_${message.guild.id}_${user.id}`)
    if(!level) {
      level = 1
    }
    let xp = db.get(`xp_${message.guild.id}_${user.id}`)
    if(!xp) {
      xp = 0
    }
    let embed = new Discord.MessageEmbed()
    .setTitle(`${user.username}'s rank`)
    .setDescription(`level - ${level} \nxp - ${xp}`)
    .setColor("GREEN")
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    message.channel.send(embed)
  }
  if(command.toLowerCase() === "bbc") {
  if(!args[0]) {
  let bbcvalue = db.get(`bbcvalue_${client.user.id}`)
  let oldbbcvalue = db.get(`oldbbcvalue_${client.user.id}`)
	let myChart = new QuickChart();
  myChart
  .setConfig({
    type: 'line',
    data: { labels: ['Original Value', 'Previous Value','Current Value' ], datasets: [{ label: 'BBC Value', data: [100, oldbbcvalue, bbcvalue ] }] },
  })
  .setWidth(800)
  .setHeight(400);

  let image = myChart.getUrl();
  let embed = new Discord.MessageEmbed()
  .setImage(image)
  .setTitle(`BBC Coin (In Bot Currency)`)
  .setDescription(`${bbcvalue}$ Of Value`)
  .setFooter(`this is NOT a real currency / cryptocurrency! this is to simulate a real currency, therefore it is not a real one.`)
  .setColor("GREEN")
  .setThumbnail(client.user.displayAvatarURL())
  message.channel.send(embed)
  }
  }
  if(command.toLowerCase() === "mine") {
    let user = message.author
    if(!args[0]) {
    let mining = db.get(`mining_${user.id}`)
    if(!mining) {
      message.channel.send(`You started mining! do \`${prefix}mine stats\` to check closer info!`)
      let dateofstartx = moment(new Date()).format("x")
      db.set(`dateofstart_${user.id}`, dateofstartx)
      let bbc = db.get(`bbc.${user.id}`)
      if(!bbc) {
        bbc = 0
        db.set(`bbc.${user.id}`, 0)
      }
      db.set(`bbcofstart.${user.id}`, bbc)
      db.set(`mining_${user.id}`, true)
      let timeout = 180000;
      setInterval(function() {
        let bbcointoadd = Math.abs(Math.floor(Math.floor(Math.random() * 70) + 1) / 10000);
        db.add(`bbc.${user.id}`, bbcointoadd)
      }, timeout)
    } else {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Error`)
      .setDescription(`You are already mining! use \`${prefix}mine stats\` to see your stats`)
      .setColor("RED")
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter(`this is NOT a real currency / cryptocurrency! this is to simulate a real currency, therefore it is not a real one.`)
      message.channel.send(embed)
    }
  }
  else if(args[0].toLowerCase() === "stats") {
    let mining = db.get(`mining_${user.id}`)
    if(mining === true) {
    let dateofstartx = moment(new Date()).format("x")
    let anotherdateofstart = db.get(`dateofstart_${user.id}`)
    let dateofstart = ms(Math.floor(ms(dateofstartx) - ms(anotherdateofstart)))
    let bbc = db.get(`bbc.${user.id}`).toFixed(4)
    if(!bbc) {
      bbc = 0
    }
    let bbcofstart = db.get(`bbcofstart.${user.id}`).toFixed(4)
    if(!bbcofstart) {
      bbcofstart = 0
    }
    let howmanybbc = Math.abs(bbc - bbcofstart)
    let bbcvalue = db.get(`bbcvalue_${client.user.id}`)
    let oldbbcvalue = db.get(`oldbbcvalue_${client.user.id}`)
	  let myChart = new QuickChart();
    myChart
    .setConfig({
      type: 'line',
      data: { labels: ['Original Value', 'Previous Value','Current Value' ], datasets: [{ label: 'BBC Value', data: [100, oldbbcvalue, bbcvalue ] }] },
    })
    .setWidth(800)
    .setHeight(400);
    let image = myChart.getUrl();
    let embed = new Discord.MessageEmbed()
    .setTitle(`Your mining status`)
    .setDescription(`You started ${dateofstart} ago \nBBC mined: ${howmanybbc.toFixed(4)} <:BestBotCoin:884447303954481153> \nValue for BBC: ${bbcvalue}$`)
    .setImage(image)
    .setColor("GREEN")
    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
    .setFooter(`this is NOT a real currency / cryptocurrency! this is to simulate a real currency, therefore it is not a real one.`)
    message.channel.send(embed)
  }
  else {
    let embed = new Discord.MessageEmbed()
    .setTitle(`Error`)
    .setDescription(`You are not currently mining! use \`${prefix}mine\` to start mining`)
    .setColor("RED")
    .setThumbnail(client.user.displayAvatarURL())
    .setFooter(`this is NOT a real currency / cryptocurrency! this is to simulate a real currency, therefore it is not a real one.`)
    message.channel.send(embed)
  }
  }
  else if(args[0].toLowerCase() === "stop") {
      let user = message.author
      let checkifmining = db.get(`mining_${user.id}`)
      if(checkifmining === true) {
      let dateofstartx = moment(new Date()).format("x")
      let anotherdateofstart = db.get(`dateofstart_${user.id}`)
      let dateofstart = ms(Math.floor(ms(dateofstartx) - ms(anotherdateofstart)))
      let bbc = db.get(`bbc.${user.id}`)
      if(!bbc) {
        bbc = 0.0000;
      }
      let bbcofstart = db.get(`bbcofstart.${user.id}`)
      if(!bbcofstart) {
        bbcofstart = 0.0000;
      }
      let howmanybbc = Math.floor(bbc - bbcofstart)
      if(!howmanybbc) {
        howmanybbc = 0.0000;
      }
      db.delete(`mining_${user.id}`)
      let embed = new Discord.MessageEmbed()
      .setTitle(`Stopped`)
      .setDescription(`You stopped mining!\n\n**__Final Status__**\nTime Spent: ${dateofstart} \nBBC mined: ${howmanybbc}`)
      .setColor("ORANGE")
      .setThumbnail(user.displayAvatarURL())
      .setFooter(`this is NOT a real currency / cryptocurrency! this is to simulate a real currency, therefore it is not a real one.`)
      message.author.send(embed)
    }
    else {
    let embed = new Discord.MessageEmbed()
    .setTitle(`Error`)
    .setDescription(`You are not currently mining! use \`${prefix}mine\` to start mining`)
    .setColor("RED")
    .setThumbnail(client.user.displayAvatarURL())
    .setFooter(`this is NOT a real currency / cryptocurrency! this is to simulate a real currency, therefore it is not a real one.`)
    message.channel.send(embed)
    }
  }
  }
  if(command.toLowerCase() === "sell") {
    if(!args[0]) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Error ID: 02 || Error ID: 09`)
      .setDescription(`no args defined || text type invalid`)
      .setColor("RED")
      .setFooter(`Make sure you type what you are selling and it HAS to exist`)
      message.channel.send(embed)
    }
    else if(args[0].toLowerCase() === "bbc") {
      let quantity = args[1]
      let bbc = db.get(`bbc.${message.author.id}`)
      if(!quantity || bbc < quantity ) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Error ID: 02 | Error ID: 09 | Error ID: 15`)
      .setDescription(`no args defined | text type invalid | not enough data`)
      .setColor("RED")
      .setFooter(`Make sure you type how much BBC you are selling! Also make sure you have enough BBC to sell`)
      return message.channel.send(embed)
      }
      else {
        let developer = db.get(`bestbotdeveloper_${message.author.id}`)
        let vip = db.get(`vip.${message.author.id}`)
        let vipruby = db.get(`vipruby.${message.author.id}`)
        let vipgod = db.get(`vipgod.${message.author.id}`)
        let tendayvip = db.get(`10dayvip_${message.author.id}`)
        let value = db.get(`bbcvalue_${client.user.id}`)
        let money = quantity * value
        let embed = new Discord.MessageEmbed()
        .setTitle(`You sold **${quantity}** of BBC`)
        .setDescription(`You got **${money}**$ for selling **${quantity}** of BBC \n Value per BBC: **${value}**`)
        .setColor("GREEN")
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        if(developer === true || vip === true || tendayvip >= 1) {
          embed.setFooter(`bonus - 10%`)
          let realmoney = quantity * value 
          let tenpercent = Math.floor(quantity * value) / 10;
          money = realmoney + tenpercent
          embed.setDescription(`You got **${money}**$ for selling **${quantity}** of BBC \n Value: **${value}**`)
        }
        else if(vipruby === true) {
          embed.setFooter(`bonus - 15%`)
          let realmoney = quantity * value 
          let percent = Math.floor(quantity * value) / 100;
          let fifteenpercent = percent * 15
          money = realmoney + fifteenpercent
          embed.setDescription(`You got **${money}**$ for selling **${quantity}** of BBC \n Value: **${value}**`)
        } else if(vipgod === true) {
          embed.setFooter(`bonus - 25%`)
          let realmoney = quantity * value 
          let percent = Math.floor(quantity * value) / 100
          let twentyfivepercent = percent * 25
          money = realmoney + twentyfivepercent
          embed.setDescription(`You got **${money}**$ for selling **${quantity}** of BBC \n Value: **${value}**`)
        }
        message.channel.send(embed)
        db.add(`money_${message.author.id}`, money)
        db.subtract(`bbc.${message.author.id}`, quantity)
      }
    }
  }
  if(command.toLowerCase() === "moneyadd") {
    let developer = db.get(`bestbotdeveloper_${message.author.id}`)
    if(developer === true) {
      let quantity = args[1]
      let user = message.mentions.users.first()
      if(!user) {
        user = message.author
        quantity = args[0]
      }
      if(!quantity) {
        quantity = 1
      }
      db.add(`money_${user.id}`, quantity)
      let embed = new Discord.MessageEmbed()
      .setTitle(`You added **${quantity}** of money to **${user.username}**`)
      .setColor("GREEN")
      message.channel.send(embed)
    }
    else {
      return
    }
  } 
  if(command.toLowerCase() === "vote") {
    let button = new MessageButton()
    .setLabel("Vote here!")
    .setStyle("url")
    .setURL("https://www.dcbestbot.tk")
    message.channel.send("Vote on us here!", button)
  }
  if(command.toLowerCase() === "trigger") {
    let user = message.mentions.users.first();
    if(!user) {
      user = message.author
    }
    let image = await new DIG.Triggered().getImage(user.displayAvatarURL({ dynamic: false, format: 'png' }));
    let attachment = new Discord.MessageAttachment(image, "trigger.png")
    message.channel.send(attachment)
  }
  if(command.toLowerCase() === "shop" || command.toLowerCase() === "store") {
    let embed = new Discord.MessageEmbed()
    .setTitle(`The SHOP`)
    .setDescription(`Items on sell!`)
    .addField("<:vip:887808862638456873> VIP (ID: \`\`vip\`\`)", "**3,5M**$ (as an item to gift or collect) **OR** **5M**$ for your own first permanent vip")
    .addField(" <:VIPRuby:887808842770026526> VIP Ruby (ID: \`\`vipruby\`\`)", "**7,5M**$ (as an item to gift or collect) **OR** **10M**$ for your own first permanent vip ruby")
    .addField("<:VIPGod:887808794271313940> VIP God (ID: \`\`vipgod\`\`)", "**25M**$ (as an item to gift or collect) **OR** **30M**$ for your own first permanent vip god")
    .setColor("GREEN")
    .setThumbnail(client.user.displayAvatarURL())
    .setFooter(`Choose wisely before you spend`)
    message.channel.send(embed)
  }
  if(command.toLowerCase() === "buy") {
    let itemtobuy = args[0]
    if(!itemtobuy) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Error ID: 02`)
      .setDescription(`no args defined`)
      .setColor("RED")
      .setFooter(`You need to specify an item to buy`)
      message.channel.send(embed)
    }
    else if(args[0].toLowerCase() === "vip") {
      let quantity = args[1]
      if(!quantity) {
        quantity = 1
      }
      let money = db.get(`money_${message.author.id}`)
      let vip = db.get(`vip.${message.author.id}`)
      let vipgod = db.get(`vipgod.${message.author.id}`)
      let vipruby = db.get(`vipruby.${message.author.id}`)
      if(!vip && !vipgod && !vipruby) {
        if(money < 5000000) {
      let embed = new Discord.MessageEmbed()
      .setTitle(`Error ID: 15`)
      .setDescription(`not enough data`)
      .setColor("RED")
      .setFooter(`You do not have enough money to buy vip`)
      return message.channel.send(embed)
        }
        else {
        db.set(`vip.${message.author.id}`, true)
        db.add(`vipcount_${client.user.id}`, 1)
        let embed = new Discord.MessageEmbed()
        .setTitle(`You just bought VIP for the first time!`)
        .setDescription(`Congratulations on your vip! you can see your perks on \`\`${prefix}perks vip\`\``)
        .setColor("GREEN")
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setFooter("New vip added")
        message.channel.send(embed)
        db.subtract(`money_${message.author.id}`, 5000000)
        }
      }
      else {
        if(money < 3500000 * quantity) {
        let embed = new Discord.MessageEmbed()
        .setTitle(`Error ID: 15`)
        .setDescription(`not enough data`)
        .setColor("RED")
        .setFooter(`You do not have enough money to buy vip`)
        return message.channel.send(embed)
        } else {
        db.add(`vipGift.${message.author.id}`, quantity)
        let embed = new Discord.MessageEmbed()
        .setTitle(`You just bought ${quantity} of VIPs!`)
        .setDescription(`You can now gift your vip(s) to other people or just collect them!`)
        .setColor("GREEN")
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setFooter("New vip added")
        message.channel.send(embed)
        let money = quantity * 3500000
        db.subtract(`money_${message.author.id}`, money)
      }
      }
    }
  }
  if(command.toLowerCase() === "bbcadd") {
    let developer = db.get(`bestbotdeveloper_${message.author.id}`)
    if(developer === true) {
      let quantity = args[1]
      let user = message.mentions.users.first()
      if(!user) {
        user = message.author
        quantity = args[0]
      }
      if(!quantity) {
        quantity = 0.0001
      }
      db.add(`bbc.${user.id}`, quantity)
      let embed = new Discord.MessageEmbed()
      .setTitle(`You added **${quantity}** of bbc to **${user.username}**`)
      .setColor("GREEN")
      message.channel.send(embed)
    }
    else {
      return
    }
  }
  if(command.toLowerCase() === "moneyremove") {
    let developer = db.get(`bestbotdeveloper_${message.author.id}`)
    if(developer === true) {
      let quantity = args[1]
      let user = message.mentions.users.first()
      if(!user) {
        user = message.author
        quantity = args[0]
      }
      if(!quantity) {
        quantity = 1
      }
      db.subtract(`money_${user.id}`, quantity)
      let embed = new Discord.MessageEmbed()
      .setTitle(`You removed **${quantity}** of money from **${user.username}**`)
      .setColor("GREEN")
      message.channel.send(embed)
    }
    else {
      return
    }
  }
  if(command.toLowerCase() === "bbcremove") {
    let developer = db.get(`bestbotdeveloper_${message.author.id}`)
    if(developer === true) {
      let quantity = args[1]
      let user = message.mentions.users.first()
      if(!user) {
        user = message.author
        quantity = args[0]
      }
      if(!quantity) {
        quantity = 0.0001
      }
      db.subtract(`bbc.${user.id}`, quantity)
      let embed = new Discord.MessageEmbed()
      .setTitle(`You removed **${quantity}** of bbc from **${user.username}**`)
      .setColor("GREEN")
      message.channel.send(embed)
    }
    else {
      return
    }
  }
  if(command.toLowerCase() === "meme") {
let embed = new Discord.MessageEmbed();
	got('https://www.reddit.com/r/memes/random/.json')
		.then(response => {
			const [list] = JSON.parse(response.body);
			const [post] = list.data.children;

			const permalink = post.data.permalink;
			const memeUrl = `https://reddit.com${permalink}`;
			const memeImage = post.data.url;
			const memeTitle = post.data.title;
			const memeUpvotes = post.data.ups;
			const memeNumComments = post.data.num_comments;

			embed.setTitle(`${memeTitle}`);
			embed.setURL(`${memeUrl}`);
			embed.setColor('RANDOM');
			embed.setImage(memeImage);
			embed.setFooter(`👍 ${memeUpvotes} 💬 ${memeNumComments}`);

			message.channel.send(embed);
		})
		.catch(console.error);
}
  if(command.toLowerCase() === "leaderboard" || command.toLowerCase() === "lb") {
    if(!args[0]) {
  let guild = client.guilds.cache.get(message.guild.id);
  let array = [];
    guild.members.cache.forEach(user => {
      array.push(user)
    })

    let allmemberslength = array.length;
    let members = 0;
    let limittoshow = 10;

    let anotherarray = [];

    for(let j = 0; j < allmemberslength; j++) {
      let money = db.fetch(`money_${array[j].id}`)
      
      if(!money || money === null) continue;

      anotherarray.push({ 
        name: array[j].user.tag, 
        money: money
      })
    }

    let newlb = [];
    anotherarray.sort((a, b) => b.money - a.money)
    for(let a = 0; a < anotherarray.length; a++) {
      members++
      if(members >= limittoshow) continue;
      let emoji = ":small_blue_diamond:"
      if(a === 0) {
        emoji = ":first_place:"
      }
      else if(a === 1) {
        emoji = ":second_place:"
      }
      else if(a === 2) {
        emoji = ":third_place:"
      }
      newlb.push(`${emoji} ${anotherarray[a].name} - ${anotherarray[a].money}$`)
    }
    let finallb = newlb.join("\n")
    let leaderboard = new Discord.MessageEmbed()
    .setTitle(`${message.guild.name}'s leaderboard`)
    .setColor("RANDOM")
    .setDescription(finallb)
    .addField(`Cool fonts`, `[${message.guild.name} Leaderboard url](https://www.dcbestbot.tk/leaderboard/${message.guild.id})`)
    .setThumbnail(message.guild.iconURL())
    message.channel.send(leaderboard)
    }
    else if(args[0].toLowerCase() === "global") {
    let array = [];
    client.users.cache.forEach(user => {
      array.push(user)
    })

    let allmemberslength = array.length;
    let members = 0;
    let limittoshow = 10;

    let anotherarray = [];

    for(let j = 0; j < allmemberslength; j++) {
      let money = db.fetch(`money_${array[j].id}`)
      
      if(!money || money === null) continue;

      anotherarray.push({ 
        name: array[j].tag, 
        money: money 
      })
    }

    let newlb = [];
    anotherarray.sort((a, b) => b.money - a.money)
    for(let a = 0; a < anotherarray.length; a++) {
      members++
      if(members >= limittoshow) continue;
      let emoji = ":small_blue_diamond:"
      if(a === 0) {
        emoji = ":first_place:"
      }
      else if(a === 1) {
        emoji = ":second_place:"
      }
      else if(a === 2) {
        emoji = ":third_place:"
      }
      newlb.push(`${emoji} **${anotherarray[a].name}** - **${anotherarray[a].money}**$`)
    }
    let finallb = newlb.join("\n")

    let embed = new Discord.MessageEmbed()
    .setTitle(`Top 10 Richest People`)
    .setDescription(finallb)
    .setColor("PURPLE")
    .setThumbnail(client.user.displayAvatarURL())
    .addField(`Cool fonts`, `[Global Leaderboard url](https://www.dcbestbot.tk/leaderboard)`)
    message.channel.send(embed)
  }
  }
  if(command.toLowerCase() === "tweet") {
    let username = args[0]
    let text = args.slice(1).join(' ')
    if(!username) {
      username = message.author.username;
      text = args.slice(0).join(' ')
    }
    if(!text) {
      text = "I don't know how to do a tweet"
    }

    await fetch(`https://nekobot.xyz/api/imagegen?type=tweet&username=${username}&text=${text}`).then(async res => {
      let json = await res.json();
      let attachment = new Discord.MessageAttachment(json.message, "tweet.png");
      message.channel.send(attachment)
    })
  }
  if(command.toLowerCase() === "changemymind" || command.toLowerCase() === "cmm") {
    let text = args.slice(0).join(' ')
    if(!text) {
      text = "I don't know"
    }

    await fetch(`https://nekobot.xyz/api/imagegen?type=changemymind&text=${text}`).then(async res => {
      let json = await res.json();
      let attachment = new Discord.MessageAttachment(json.message, "changemymind.png");
      message.channel.send(attachment)
    })
  }
})

MenusManager.on('MENU_CLICKED', async (menu) => {
  if(menu.values == "Moderation") {
    menu.reply("Coming soon!")
  }
  else if(menu.values == "Economy") {
    let embed = new Discord.MessageEmbed()
    .setTitle(`Economy Commands`)
    .setDescription(`\`\`?balance\`\` - Checks someone's balance or your balance \n\`\`?deposit\`\` - Deposit money on the bank\n\`\`?withdraw\`\` - Withdraw money from the bank\n\`\`?beg\`\` - Beg for money \n\`\`?mine\`\` - Mine BBC to sell for money or execute:\n\`\`?mine stats\`\` - For the stats \n\`\`?mine stop\`\` - To stop mining and see the final results \n\`\`?sell\`\` - Sell an item or bbc, to sell you need to do: \n\`\`?sell <item / bbc> (quantity or nothing(it will detect as 1))\`\` - **sells** something`)
    .setColor(`GREEN`)
    .setFooter(`More stuff soon!`)
    .setThumbnail(client.user.displayAvatarURL())
    menu.reply(embed)
  }
  else if(menu.values == "Fun") {
    let embed = new Discord.MessageEmbed()
    .setTitle(`Fun Commands`)
    .setDescription(`**__Image Manipulation__** \n\`\`?trash <user mention (optional)>\`\`\n \`\`?trigger <user mention (optional)>\`\`\n \`\`?tweet <username (optional)> <tweet>\`\`\n \`\`?changemymind <funny text>\`\` \n\n**__Random Stuff__** \n \`\`?meme\`\``)
    .setColor(`GREEN`)
    .setThumbnail(client.user.displayAvatarURL())
    .setFooter(`More stuff soon!`)
    menu.reply(embed)
  }
  else if(menu.values == "Others") {
    let embed = new Discord.MessageEmbed()
    .setTitle(`Other Commands`)
    .setDescription(`\`\`?profile\`\` - shows your profile, remember your profile tag, can be important if you want to see how your profile looks on our website! \n\`\`?mail\`\` - sees your mail or performes some functions as:\n\`\`?mail send <profiletag / user mention> <your message>\`\` \n\`\`?mail clear\`\` \n\`\`?settings\`\` - your settings, also can be used for: \n\`\`?set aboutme <newaboutme>\`\` - sets about me\n\`\`?set p_setcolor <color code>\`\` - sets the profile color (can be rgb or hex)`)
    .setColor(`GREEN`)
    .setFooter(`More stuff soon!`)
    .setThumbnail(client.user.displayAvatarURL())
    menu.reply(embed)
  }
});

client.on("ready", () => {
  let guilds = client.guilds.cache.array();
  for (let i = 0; i < guilds.length; i++) {
    client.guilds.cache.get(guilds[i].id).members.fetch().then(r => {
      r.array().forEach(r => {
        db.delete(`begtrue_${r.user.id}`)
        db.delete(`mining_${r.user.id}`)
        let vip = db.get(`vip.${r.user.id}`)
        let vipruby = db.get(`vipruby.${r.user.id}`)
        let vipgod = db.get(`vipgod.${r.user.id}`)
      });
    });
  }
  let vipcount = db.get(`vipcount_${client.user.id}`)
  if(!vipcount) {
    vipcount = 0
  }
  let viprubycount = db.get(`viprubycount_${client.user.id}`)
  if(!viprubycount) {
    viprubycount = 0
  }
  let vipgodcount = db.get(`vipgodcount_${client.user.id}`)
  if(!vipgodcount) {
    vipgodcount = 0
  }
  console.log("Active vip users - " + vipcount)
  console.log("Active vip ruby users - " + viprubycount)
  console.log("Active vip god users - " + vipgodcount)
})

client.on("ready", () => {
  setInterval(function() {
    let bbcvalue = db.get(`bbcvalue_${client.user.id}`)
    if(bbcvalue <= 0) {
      bbcvalue = Math.floor(Math.random() * 100) + 1;
    }
    db.set(`oldbbcvalue_${client.user.id}`, bbcvalue)
    let chances = Math.floor(Math.random() * 6000) + 1;
    let changed = "no"
    if(chances >= 3500) {
      let newbbcvaluerandom = Math.floor(Math.random() * 6) + 1;
      let valuetoadd = Math.floor(bbcvalue / 100) * newbbcvaluerandom;
      let newbbcvalue = bbcvalue + valuetoadd;
      changed = "yes"
      db.set(`bbcvalue_${client.user.id}`, newbbcvalue)
    }
    else if(chances <= 3499 && chances >= 1500) {
      db.set(`bbcvalue_${client.user.id}`, bbcvalue)
      changed = changed
    }
    else if(chances > 1500) {
      let newbbcvaluerandom = Math.floor(Math.random() * 6) + 1;
      let bbcvaluetoreduce = Math.floor(bbcvalue / 100) * newbbcvaluerandom
      changed = "forlow"
      let newbbcvalue = bbcvalue - bbcvaluetoreduce;
      db.set(`bbcvalue_${client.user.id}`, newbbcvalue)
    }
    }, 2400000)
})

client.on("guildCreate", guild => {
    let channelID;
    let channels = guild.channels.cache;

    channelLoop:
    for (let key in channels) {
        let c = channels[key];
        if (c[1].type === "text") {
            channelID = c[0];
            break channelLoop;
        }
    }

    let channel = guild.channels.cache.get(guild.systemChannelID || channelID);
    let joinembed = new Discord.MessageEmbed()
    .setTitle(`Hey there!`)
    .setDescription(`Thanks for inviting me to your server! please use \`\`?help\`\` if you need help with any command, the default prefix is \`\`?\`\` but you can change it later. \nHope you have fun!`)
    .setThumbnail(guild.iconURL())
    .setColor("RANDOM")
    .setFooter(`Guild #` + client.guilds.cache.size)
    channel.send(joinembed);
});

client.login(process.env["token"])