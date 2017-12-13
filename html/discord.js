var http = {
    request: function(url = new String, options = new Object) {
        return new Promise((res,rej)=>{
            let req = new XMLHttpRequest()
            options.data = options.body || options.data;

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

            req.send(options.data)
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
    constructor(guild = new Guild, id) {
        http.request(`discord-api/guilds/${guild.id}/members/${id}`,{method:"GET",headers:{authorization:discord.client.token}}).then(r=>{
            for (let x in r)
                this[x] = r[x]
        })
    }
}

class Client {
    constructor(token = new String) {
        http.request("discord-api/users/@me",{method:"GET",headers:{authorization:token}}).then(r=>{
            for (let x in r)
                this[x] = r[x]
        }).catch(r=>{
            new Error("invalid token")
        })
        this.token = token
    }
}

class Channel {
    constructor(guild = new Guild, id) {
        http.request(`discord-api/channels/${id}`,{method:"GET",headers:{authorization:discord.client.token}}).then(r=>{
            for (let x in r)
                this[x] = r[x]
        })
        this.guild = guild
        this.guild_id = undefined
        // this.guild.channels.set(this.id,this)
    }

    createMessage(msg) {
        return http.request(`discord-api/channels/messages`,{method:"POST",headers:{authorization:discord.client.token}})
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

let ddone = new Event("discordDone")

window.addEventListener("discordDone",()=>{
    /* <div class="guild">
        <div draggable="true">
            <div class="guild-inner" draggable="false">
                <a class="avatar-small" draggable="false" class="avatar-small" style="background-image: url('https://cdn.discordapp.com/icons/295341979800436736/f48dfb6e89ba99f26b476ebd03e09029.webp');"></a>
            </div>
        </div>
    </div> */
    console.log("discord done load")
    /* console.log("populating guild scroller")
    discord.client.guilds.forEach(g=>{
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
    }) */
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

window.addEventListener("load",function(w,ev) {
    let token = prompt("token","mfa...")
    if (!token || token == "mfa..." || token.trim() == "") {
        throw new Error("no token")
        return;
    }

    window.discord = {}
    /* discord.client = new Client(token) */

    /* http.request("discord-api/users/@me/guilds",{method:"GET",headers:{authorization:token}},(r)=>{
        let guilds = r
        discord.client.guilds = new Map()
        for (let x in guilds) {
            let g = new Guild(guilds[x].id)
            discord.client.guilds.set(g.id,g)
        }
    }) */
})