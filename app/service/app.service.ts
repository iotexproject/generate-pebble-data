import _ from "lodash"
import BaseService from "./base.service"
// import { appStore } from "@store/index"
// import { logger } from "@common/utils"
import { MqttService } from "./mqtt.service"

class AppService extends BaseService {
  public async list(params: any) {
    const { name, page, pageSize } = params
    const where = {}
    if (!_.isNil(name)) _.assign(where, { name })

    // const { rows, count } = await appStore.findAndCountAll({
    //   where,
    //   offset: page * pageSize,
    //   limit: pageSize,
    //   order: [["id", "ASC"]],
    // })

    return {
      // count,
      // rows: rows.map((v) => v.serializer()),
    }
  }

  public async onEvent(event: any) {
    const { event: n } = event
    try {
      if (n == "FirmwareUpdated") {
        await this.onFirmwareUpdated(event)
      }
    } catch (e) {
      // logger.error(e.toString())
    }
  }

  public async onFirmwareUpdated(event: any) {
    const { name, version, uri, avatar } = event.returnValues
    // await appStore.upsert({ name, version, uri, avatar })

    const client = await MqttService.createClient()
    if (!client) return

    try {
      await client.publish(`device/app_updated/${name}`, JSON.stringify({ name, version, uri }))
    } catch (e) {
      // logger.error(e.toString())
    }
  }
}

export const appService = new AppService()
