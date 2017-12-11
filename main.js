var http = require("http")
var fetch = require("node-fetch")
var fs = require("fs")

http.createServer(function (req, res) {
    if (req.url == "/") {
    	res.write(fs.readFileSync("html/discord.html"))
        return res.end()
    } else if (req.url.toLowerCase().search(/(\/html\/\w*\.css|\/html\/\w*\.js)/) != -1) { // css sheets and others
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.write(fs.readFileSync(req.url.slice(1)))
        return res.end()
    } else if (req.url.toLowerCase().search("/discord-api") != -1) { // here we go
        let apireq = req.url.split("/").splice(2).join("/")
        let meme = {0:"shouldnt see this"}

        fetch(`https://discordapp.com/api/${apireq}`,{headers:{authorization:req.headers.authorization}}).then((r)=>{
            res.statusCode = r.status
            res.statusMessage = r.statusMessage
            r.json().then((j)=>{
                meme = j
                res.write(JSON.stringify(meme))
                res.end()
            })
        })
    } else { // 404
        res.write(fs.readFileSync("html/404.html"))
        return res.end()
    }
}).listen(16000)