import { BlitzApiRequest, BlitzApiResponse } from "blitz"
import { BinPackage, SensorData } from "app/protogen/pebble"
import { MqttService } from "app/service"
import { ecsign, sha256, setLengthLeft, toBuffer } from "ethereumjs-util"
import _ from "lodash"

const handler = async (req: BlitzApiRequest, res: BlitzApiResponse) => {
  console.log(req, res)
  const imei = req.body.imei
  const privateKey = req.body.privateKey
  const requestData: SensorData = JSON.parse(req.body.data)
  const sensorData = SensorData.create(requestData)
  console.log('sensorData', sensorData)
  const data = Buffer.from(SensorData.encode(sensorData).finish())
  const timestamp = _.round(JSON.parse(req.body.data).timestamp)
  const type = BinPackage.PackageType.DATA

  const hash = sha256(
    Buffer.concat([setLengthLeft(toBuffer(type), 4), data, setLengthLeft(toBuffer(timestamp), 4)])
  )

  // CLIENT_PK
  try {
    const { r, s, v } = ecsign(hash, Buffer.from(privateKey, "hex"))
    const signature = Buffer.concat([r, s])

    const binPackage = BinPackage.encode({
      type: type,
      data: data,
      timestamp: timestamp,
      signature: signature,
    })
    const pkg = Buffer.from(binPackage.finish())
    const client = await MqttService.createClient()
    console.log('client', client, pkg)
    try {
      const response = await client?.publish(`device/${imei}/data`, pkg)
      const end = await client?.end()
      console.log('response', response, end)
      res.json({ success: true })
    } catch (e) {
      console.log(e.toString())
      res.json({ msg: e.toString(), success: false })
    }
  } catch (error) {
    console.log(error.toString())
    res.json({ msg: error.toString(), success: false })
  }
}
export default handler
