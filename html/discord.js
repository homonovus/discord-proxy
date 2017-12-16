var http = {
    request: function(url, options) {
        return new Promise((res,rej)=>{
            let req = new XMLHttpRequest()
            let data = options.body || options.data
            let body = ""; let i = 0

            for (let x in options.body) {
                if (i!=0)
                    body+="&"
                body+=`${x}=${options.body[x]}`
                i++
            }

            req.onreadystatechange = (ev)=>{
                if (req.readyState == 4)
                    res(JSON.parse(req.responseText))
            }
            req.onerror = ()=>{
                rej(req.responseText,req.statusText)
            }
            
            req.open(options.method,url,true,options.user,options.password)

            for (let x in options.headers) {
                req.setRequestHeader(x,options.headers[x])
            }

            req.send(body)
        })
    }
}

class User {
    constructor(id) {
        http.request(`discord-api/users/${id}`,{method:"GET",headers:{authorization:discord.client.token}}).then(r=>{
            for (let x in r)
                this[x] = r[x]
        })
    }
}

class GuildMember {
    constructor(guild, id) {
        this.guild = guild
        http.request(`discord-api/guilds/${guild.id}/members/${id}`,{method:"GET",headers:{authorization:discord.client.token}}).then(r=>{
            for (let x in r)
                this[x] = r[x]
        })
    }
}

class Client {
    constructor(token) {
        this.token = token
        http.request("discord-api/users/@me",{method:"GET",headers:{authorization:token}}).then(r=>{
            for (let x in r)
                this[x] = r[x]
        })
    }
}

class Channel {
    constructor(guild, id) {
        this.guild = guild
        this.id = id
        http.request(`discord-api/channels/${id}`,{method:"GET",headers:{authorization:discord.client.token}}).then(r=>{
            for (let x in r) {
                this[x] = r[x]
            }
        })
    }

    createMessage(msg) {
        if (typeof msg == "string")
            return http.request(`discord-api/channels/${this.id}/messages`,{
                method:"POST",
                body:{content:msg},
                headers:{
                    authorization:discord.client.token,
                    "Content-Type":"application/x-www-form-urlencoded"
                }
            })
        else if (typeof msg == "object")
            return http.request(`discord-api/channels/messages`,{
                method:"POST",
                body:msg,
                headers:{
                    authorization:discord.client.token,
                    "Content-Type":"application/x-www-form-urlencoded"
                }
            })
    }

    deleteMessage(id) {
        return http.request(`discord-api/channels/${this.id}/messages/${id}`,{method:"DELETE",headers:{authorization:discord.client.token}})
    }
}

class Guild {
    constructor(id) {
        this.id = id
        http.request(`discord-api/guilds/${id}`,{method:"GET",headers:{authorization:discord.client.token}}).then(r=>{
            for (let x in r)
                this[x] = r[x]
        })

        this.channels = new Map()
        /* http.request(`discord-api/guilds/${id}/channels`,{method:"GET",headers:{authorization:discord.client.token}},(r)=>{
            for (let x in r) {
                let c = new Channel(this, r[x].id)
                console.log(this)
                this.channels.set(c.id,c)
            }
        }) */

        this.members = new Map()
        /* http.request(`discord-api/guilds/${id}/members`,{method:"GET",headers:{authorization:discord.client.token}},(r)=>{
            for (let x in r) {
                let m = new GuildMember(this, r[x].user.id)
                this.members.set(r[x].user.id,m)
            }
        }) */
    }
}

class Message {
    constructor(channel,id) {
        this.channel = channel
        this.id = id
        this.content = "sick me me dude"
        /* http.request(`discord-api/channels/${channel.id}/messages/${id}`,{method:"GET",headers:{authorization:discord.client.token}}).then(r=>{
            for (let x in r)
                this[x] = r[x]
            window.dispatchEvent(new CustomEvent("discordMessage"))
        }) */
    }
}

window.addEventListener("discordDone",e=>{
    console.log("discord done, populate guild scroller")

    // client info
    $(".channel-scroller.settings .avatar-small")[0].style.backgroundImage = `url("https://cdn.discordapp.com/avatars/${discord.client.id}/${discord.client.avatar}.webp")`
    $(".channel-scroller.settings .username").text(discord.client.username)
    $(".channel-scroller.settings .discriminator").text("#"+discord.client.discriminator)
    setTimeout(() => {
        discord.client.guilds.forEach(g=>{
            $(`<div class="guild">
                <div draggable="true">
                    <div class="guild-inner" draggable="false">
                        <a class="avatar-small" title="${g.name}" draggable="false" class="avatar-small" style="background-image: url('https://cdn.discordapp.com/icons/${g.id}/${g.icon}.webp');"></a>
                    </div>
                </div>
            </div>`).appendTo(".guilds-scroller").click((ev)=>{
                discord.selectedGuild = g
                window.dispatchEvent(new CustomEvent("discordGuildUpdate"))
                $(".channel-scroller.guild").text(g.name)
            }).bind("drag",(ev)=>{
                console.log("dragging")
            })
        })
    }, 1000)
})

window.addEventListener("discordGuildUpdate",e=>{
    console.log("guild update, populate channel scroller")
    setTimeout(() => {
        $(".channel-scroller.channels").empty()
        $(".channel-container.messages").empty()
        window.dispatchEvent(new CustomEvent("discordChannelUpdate"))
        if (discord.selectedGuild.channels.size == 0){
            let g = discord.selectedGuild
            http.request(`discord-api/guilds/${g.id}/channels`,{method:"GET",headers:{authorization:discord.client.token}}).then(r=>{
                for (let x in r) {
                    if (r[x].code && r[x].code==50001) continue
                    let c = new Channel(g,r[x].id)
                    g.channels.set(r[x].id,c)
                    if (x==r.length-1)
                        window.dispatchEvent(new CustomEvent("discordGuildUpdate"))
                }
            })
        }
    }, 1000);
})

window.addEventListener("discordChannelUpdate",e=>{
    console.log("channel update, populate messages")
    discord.selectedGuild.channels.forEach(c=>{
        if (c.name == undefined || !c.name) return // fuck categories for now lol
        $(`<div class="channel text" style="order:${c.position}">${(c.type == 4 ? "+=" : "") + c.name}</div>`).appendTo(".channel-scroller.channels").click(ev=>{
            console.log("channel click",c.name,c.id)
            discord.selectedChannel = c
            $(".channel-container.titlebar").text(c.name)
        })
    })
})

window.addEventListener("discordMessage",e=>{
    console.log("new message", e.detail)
    let msg = e.detail
    // msg.channel.messages.set(msg.id,msg)
    $(".channel-container.messages").append(`<div class="message">${msg.content}</div>`)
    // discord.selectedChannel
})

/* 
    NEW MESSAGE :: WIP
    $(".channel-container.messages").append(`<div class="message">asdf</div>`)

    NEW GUILD
    $(`<div class="guild">
        <div draggable="true">
            <div class="guild-inner" draggable="false">
                <a class="avatar-small" draggable="false" class="avatar-small" style="background-image: url('https://pbs.twimg.com/profile_images/839721704163155970/LI_TRk1z_400x400.jpg');"></a>
            </div>
        </div>
    </div>`).appendTo(".guilds-scroller").click((ev)=>{
        selectedGuild = "google"
        $(".channel-scroller.guild").text(selectedGuild)
    }).bind("drag",(ev)=>{
        console.log("dragging")
    })

    NEW CHANNEL :: WIP
    $(".channel-scroller.channels").append(`<div class="message">asdf</div>`)

    UPDATE CLIENT INFO
    $(".channel-scroller.settings .avatar-small")[0].style.backgroundImage = `url("https://cdn.discordapp.com/avatars/${discord.client.id}/${discord.client.avatar}.webp")`
    $(".channel-scroller.settings .username").text(discord.client.username)
    $(".channel-scroller.settings .discriminator").text("#"+discord.client.discriminator)
*/

window.addEventListener("load",(w,e)=>{
    let token = prompt("token","mfa...")
    if (!token || token == "mfa..." || token.trim() == "") {
        throw new Error("no token")
        return;
    }

    window.discord = {}
    discord.client = new Client(token)

    /* window.dispatchEvent(new CustomEvent("discordDone")) */

    http.request("discord-api/users/@me/guilds",{method:"GET",headers:{authorization:token}}).then(r=>{
        discord.client.guilds = new Map()
        for (let x in r) {
            let g = new Guild(r[x].id)
            discord.client.guilds.set(g.id,g)
            if (x == r.length-1)
                window.dispatchEvent(new CustomEvent("discordDone"))
        }
    })
})