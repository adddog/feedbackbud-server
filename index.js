require("dotenv").config()
const ip = require("ip")
const wu = require("wu")
const spawn = require("child_process").spawnSync
const RS = require("randomstring")
const fs = require("fs")
const uuid = require("uuid")
const cors = require("cors")
const randomWord = require("random-word")
const path = require("path")
const https = require("https")
const http = require("http")
const express = require("express")
const bodyParser = require("body-parser")
const fileUpload = require("express-fileupload")
const config = require("getconfig")
const getHomePath = require("home-path")

const Socket = require("./src/socket")
const colors = require("colors")
const {
  isFunction,
  forIn,
  find,
  values,
  keys,
  compact,
  filter,
} = require("lodash")
const { parse } = require("path")

//*******************
//EXPRESS
//*******************

console.log(colors.green(`NODE_ENV: ${process.env.NODE_ENV}`))

const app = express()
const host =
  process.env.NODE_ENV === "production" ? "127.0.0.1" : "localhost"
let server

var options = {
  debug: true,
}

app.use(cors())
//app.use(require("express-force-ssl"))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(
  fileUpload({
    limits: { fileSize: 400 * 1024 * 1024 },
  })
)

var router = express.Router()
app.use(router)

const isHTTPS = process.env.SERVER_PROTOCALL === "https"
if (isHTTPS) {
  server = https.createServer(
    {
      key: fs.readFileSync(
        path.join(getHomePath(), ".localhost-ssl/local_key.pem")
      ),
      cert: fs.readFileSync(
        path.join(getHomePath(), ".localhost-ssl/local_cert.pem")
      ),
    },
    app
  )
} else {
  server = app.listen(process.env.PORT)
}

console.log(
  `Listening ${process.env.SERVER_PROTOCALL} on port  ${process.env
    .PORT}  on  ${host}`
)

//*******************
//express ROUTING
//*******************

router.get("/", function(req, res) {
  res.status(200).send("nothing to see here...")
})

router.get("/room", function(req, res) {
  res.send({ roomId: getNewRoom() })
})

const sockets = Socket(server, config)
