import _ from "lodash"
import BaseService from "./base.service"
// import { appStore, deviceRecordStore, deviceStore } from "@store/index"
import {
  SensorConfig,
  SensorData,
  SensorState,
  BinPackage,
  SensorConfirm,
  ConfirmPackage,
} from "app/protogen/pebble"
import { ecrecover, sha256, toBuffer, setLengthLeft } from "ethereumjs-util"
import { MqttService } from "./mqtt.service"
import { DeviceStatus } from "app/common/enums"

class DeviceService extends BaseService {
  // public async listData(params: any) {
  //   const { imei, page, pageSize } = params
  //   const where = {}
  //   if (!_.isNil(imei)) _.assign(where, { imei })
  //   const { rows, count } = await deviceRecordStore.findAndCountAll({
  //     where,
  //     offset: page * pageSize,
  //     limit: pageSize,
  //     order: [["createdAt", "DESC"]],
  //   })
  //   return {
  //     count,
  //     rows: rows.map((v) => v.serializer()),
  //   }
  // }
  // public async listDevice(params: any) {
  //   const { address, imei, page, pageSize } = params
  //   const where = {}
  //   if (!_.isNil(imei)) _.assign(where, { imei })
  //   if (!_.isNil(address)) _.assign(where, { address })
  //   const { rows, count } = await deviceStore.findAndCountAll({
  //     where,
  //     offset: page * pageSize,
  //     limit: pageSize,
  //     order: [["createdAt", "ASC"]],
  //   })
  //   return {
  //     count,
  //     rows: rows.map((v) => v.serializer()),
  //   }
  // }
  // public async onEvent(event: any, receipt: any) {
  //   const { event: n } = event
  //   try {
  //     if (n == "Proposal") {
  //       await this.onProposal(event)
  //     } else if (n == "Confirm") {
  //       await this.onConfirm(event)
  //     } else if (n == "Data") {
  //       await this.onData(event, receipt)
  //     } else if (n == "Firmware") {
  //       await this.onFirmware(event)
  //     } else if (n == "Remove") {
  //       await this.onRemove(event)
  //     }
  //   } catch (e) {
  //     logger.error(e.toString())
  //   }
  // }
  // private async onConfirm(event: any) {
  //   const { imei, owner, device: address } = event.returnValues
  //   await deviceStore.upsert({
  //     imei,
  //     owner,
  //     status: DeviceStatus.CONFIRM,
  //     address,
  //     proposer: null,
  //   })
  // }
  // private async onProposal(event: any) {
  //   const { imei, owner, device: address } = event.returnValues
  //   await deviceStore.upsert({
  //     imei,
  //     address,
  //     proposer: owner,
  //     status: DeviceStatus.PROPOSAL,
  //   })
  // }
  // private async onRemove(event: any) {
  //   const { imei, owner } = event.returnValues
  //   const device = await deviceStore.find(imei)
  //   if (!device || owner != device.owner) return
  //   const data = {
  //     owner: null,
  //   }
  //   if (device.status == DeviceStatus.CONFIRM) _.assign(data, { status: DeviceStatus.CREATED })
  //   if (device.proposer == owner) _.assign(data, { proposer: null })
  //   await deviceStore.update(imei, data)
  // }
  // private async onFirmware(event: any) {
  //   const { imei, app } = event.returnValues
  //   const updated = await deviceStore.setFirmware(imei, app)
  //   if (!updated) return
  //   const ap = await appStore.findOne({ name: app })
  //   if (!ap) return
  //   const client = await MqttService.createClient()
  //   if (!client) return
  //   try {
  //     await client.publish(
  //       `backend/${imei}/firmware`,
  //       JSON.stringify({ firmware: app, uri: ap.uri })
  //     )
  //   } catch (e) {
  //     logger.error(e.toString())
  //   }
  // }
  // private onData(event: any, receipt: any) {
  //   const type = _.get(event, "returnValues._type")
  //   if (type == BinPackage.PackageType.DATA) {
  //     return this.onDeviceData(event, receipt)
  //   } else if (type == BinPackage.PackageType.CONFIG) {
  //     return this.onDeviceConf(event)
  //   } else if (type == BinPackage.PackageType.STATE) {
  //     return this.onDeviceState(event)
  //   }
  // }
  // private async onDeviceData(event: any, receipt: any) {
  //   const { returnValues, transactionHash: hash } = event
  //   const { imei, operator, data, timestamp, gas } = returnValues
  //   const { gasUsed } = receipt
  //   let sd: SensorData
  //   try {
  //     sd = SensorData.decode(Buffer.from(data.slice(2), "hex"))
  //   } catch (e) {
  //     logger.error(e.toString())
  //     return
  //   }
  //   const d = {
  //     snr: np.divide(sd.snr, 100),
  //     vbat: np.divide(sd.vbat, 100),
  //     gas_resistance: np.divide(sd.gasResistance, 100),
  //     temperature: np.divide(sd.temperature, 100),
  //     temperature2: np.divide(sd.temperature2, 100),
  //     pressure: np.divide(sd.pressure, 100),
  //     humidity: np.divide(sd.humidity, 100),
  //     light: np.divide(sd.light, 100),
  //     gyroscope: JSON.stringify(sd.gyroscope),
  //     accelerometer: JSON.stringify(sd.accelerometer),
  //     latitude: np.divide(sd.latitude, 100000),
  //     longitude: np.divide(sd.longitude, 100000),
  //   }
  //   await deviceRecordStore.create({
  //     hash,
  //     imei,
  //     operator,
  //     timestamp,
  //     gas,
  //     real_gas: gasUsed,
  //     ...d,
  //   })
  // }
  // private async onDeviceConf(event: any) {
  //   const { imei, data } = event.returnValues
  //   let sc: SensorConfig
  //   try {
  //     sc = SensorConfig.decode(Buffer.from(data.slice(2), "hex"))
  //   } catch (e) {
  //     logger.error(e.toString())
  //     return
  //   }
  //   const up = await deviceStore.update(imei, {
  //     bulk_upload: sc.bulkUpload,
  //     data_channel: sc.dataChannel,
  //     upload_period: sc.uploadPeriod,
  //     bulk_upload_sampling_cnt: sc.bulkUploadSamplingCnt,
  //     bulk_upload_sampling_freq: sc.bulkUploadSamplingFreq,
  //     beep: sc.beep,
  //     real_firmware: sc.firmware,
  //   })
  //   if (!up) logger.error(`device ${imei} conf failed`)
  // }
  // private async onDeviceState(event: any) {
  //   const { imei, data } = event.returnValues
  //   let ss: SensorState
  //   try {
  //     ss = SensorState.decode(Buffer.from(data.slice(2), "hex"))
  //   } catch (e) {
  //     logger.error(e.toString())
  //     return
  //   }
  //   const up = await deviceStore.update(imei, { state: ss.state })
  //   if (!up) logger.error(`device ${imei} state failed`)
  // }
  // public async decodeConfirm(imei: string, payload: Buffer) {
  //   let pkg: ConfirmPackage
  //   try {
  //     pkg = ConfirmPackage.decode(payload)
  //   } catch (e) {
  //     logger.error(e.toString())
  //     return null
  //   }
  //   const { owner, timestamp, signature, channel } = pkg
  //   const hash = sha256(Buffer.concat([Buffer.from(owner), setLengthLeft(toBuffer(timestamp), 4)]))
  //   const sig = Buffer.from(signature)
  //   const device = await deviceStore.find(imei)
  //   if (!device) {
  //     logger.info(`device ${imei} not exist`)
  //     return null
  //   }
  //   for (let i = 0; i < 4; i++) {
  //     const v = 27 + i
  //     try {
  //       const pubkey = Buffer.concat([
  //         toBuffer(4),
  //         ecrecover(hash, v, sig.slice(0, 32), sig.slice(32, 64), 0),
  //       ])
  //       const address = publicKeyToAddress(pubkey.toString("hex"))
  //       if (device.address.toLowerCase() != address.toLowerCase()) continue
  //     } catch (e) {
  //       continue
  //     }
  //     const s = Buffer.concat([sig, toBuffer(v)])
  //     return {
  //       device,
  //       owner,
  //       timestamp,
  //       signature: s,
  //       channel,
  //     }
  //   }
  //   logger.info(`device ${imei} confirm recover failed`)
  //   return null
  // }
  // public async confirm(imei: string, payload: Buffer) {
  //   const ret = await this.decodeConfirm(imei, payload)
  //   if (!ret) return
  //   const { device, owner, timestamp, signature, channel } = ret
  //   await blockChainService.confirm(
  //     imei,
  //     "0x" + Buffer.from(owner).toString("hex"),
  //     timestamp,
  //     signature,
  //     channel
  //   )
  // }
  // public async query(imei: string) {
  //   const device = await deviceStore.find(imei)
  //   if (!device) return
  //   const client = await MqttService.createClient()
  //   if (!client) return
  //   try {
  //     await client.publish(
  //       `backend/${imei}/status`,
  //       JSON.stringify(_.pick(device, ["status", "proposer"]))
  //     )
  //   } catch (e) {
  //     logger.error(e.toString())
  //   }
  // }
  // private async decode(imei: string, payload: Buffer) {
  //   let pkg: BinPackage
  //   try {
  //     pkg = BinPackage.decode(payload)
  //   } catch (e) {
  //     logger.error(e.toString())
  //     return null
  //   }
  //   const { type, data, signature, timestamp } = pkg
  //   const buf = Buffer.from(data)
  //   const hash = sha256(
  //     Buffer.concat([setLengthLeft(toBuffer(type), 4), buf, setLengthLeft(toBuffer(timestamp), 4)])
  //   )
  //   const sig = Buffer.from(signature)
  //   const device = await deviceStore.find(imei)
  //   if (!device) {
  //     logger.info(`device ${imei} not registered`)
  //     return null
  //   }
  //   if (_.isNil(device.owner)) {
  //     logger.info(`device ${imei} has not owner`)
  //     return
  //   }
  //   for (let i = 0; i < 4; i++) {
  //     const v = 27 + i
  //     try {
  //       const pubkey = Buffer.concat([
  //         toBuffer(4),
  //         ecrecover(hash, v, sig.slice(0, 32), sig.slice(32, 64), 0),
  //       ])
  //       const address = publicKeyToAddress(pubkey.toString("hex"))
  //       if (device.address.toLowerCase() != address.toLowerCase()) continue
  //     } catch (e) {
  //       continue
  //     }
  //     const s = Buffer.concat([sig, toBuffer(v)])
  //     return {
  //       device,
  //       type,
  //       data: buf,
  //       timestamp,
  //       signature: s,
  //     }
  //   }
  //   logger.info(`device ${imei} data recover failed`)
  //   return null
  // }
  // public async addData(imei: string, payload: Buffer) {
  //   const ret = await this.decode(imei, payload)
  //   if (!ret) return
  //   const { device, type, data, signature, timestamp } = ret
  //   if (type == BinPackage.PackageType.CONFIG) {
  //     if (!this.checkConfig(device, data)) return
  //   } else if (type == BinPackage.PackageType.STATE) {
  //     if (!this.checkState(device, data)) return
  //   }
  //   await blockChainService.addData(imei, type, data, timestamp, signature)
  // }
  // private checkConfig(device: DeviceModel, data: Buffer) {
  //   let sc: SensorConfig
  //   try {
  //     sc = SensorConfig.decode(data)
  //   } catch (e) {
  //     logger.error(e.toString())
  //     return false
  //   }
  //   return !(
  //     sc.bulkUpload == device.bulk_upload &&
  //     sc.bulkUploadSamplingCnt == device.bulk_upload_sampling_cnt &&
  //     sc.bulkUploadSamplingFreq == device.bulk_upload_sampling_freq &&
  //     sc.dataChannel == device.data_channel &&
  //     sc.firmware == device.real_firmware &&
  //     sc.beep == device.beep &&
  //     sc.uploadPeriod == device.upload_period
  //   )
  // }
  // private checkState(device: DeviceModel, data: Buffer) {
  //   let ss: SensorState
  //   try {
  //     ss = SensorState.decode(data)
  //   } catch (e) {
  //     logger.error(e.toString())
  //     return
  //   }
  //   return device.state != ss.state
  // }
}

export const deviceService = new DeviceService()
