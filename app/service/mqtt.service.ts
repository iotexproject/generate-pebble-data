import _ from "lodash"
import fs from "fs"
import { connectAsync, AsyncClient } from "async-mqtt"
import BaseService from "./base.service"
import { deviceService } from "./device.service"

const key = fs.readFileSync("tls-key.pem")
const cert = fs.readFileSync("tls-cert.pem")
const ca = fs.readFileSync("root.pem")

export class MqttService extends BaseService {
  private client: AsyncClient | undefined

  public static async create() {
    const service = new MqttService()
    await service.start()
  }

  public static async createClient() {
    try {
      const client = await connectAsync(
        "mqtts://a11homvea4zo8t-ats.iot.ap-east-1.amazonaws.com:8883",
        {
          key,
          cert,
          ca,
          rejectUnauthorized: true,
        }
      )
      return client
    } catch (e) {
      console.log(e.toString())
      return undefined
    }
  }

  private async start() {
    const self = this
    const client = (this.client = await MqttService.createClient())
    if (!client) return false

    client.on("message", async (topic, payload) => {
      try {
        // await self.onMessage(topic, payload)
      } catch (e) {
        console.log(e.toString())
      }
    })

    console.info("mqtt start listen")
    try {
      await client.subscribe("device/#", { qos: 0 })
    } catch (e) {
      console.error(e.toString())
      return false
    }

    return true
  }

  // private async onMessage(topic: string, payload: Buffer) {
  //   const words = topic.split("/")
  //   const imei: string = words[1]
  //   if (imei == "") {
  //     logger.error(`topic error: ${topic}`)
  //     return
  //   }

  //   const last = _.last(words)
  //   if (last == "data") await this.onData(imei, payload)
  //   else if (last == "confirm") await this.onConfirm(imei, payload)
  //   else if (last == "query") await this.onQuery(imei)
  // }

  // private onData(imei: string, payload: Buffer) {
  //   return deviceService.addData(imei, payload)
  // }

  // private onConfirm(imei: string, payload: Buffer) {
  //   return deviceService.confirm(imei, payload)
  // }

  // private onQuery(imei: string) {
  //   return deviceService.query(imei)
  // }
}
