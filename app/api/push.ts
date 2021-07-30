import { BlitzApiRequest, BlitzApiResponse } from "blitz"
import { BinPackage, SensorData } from "app/protogen/pebble"
import { MqttService } from "app/service"
import { ecsign, sha256, setLengthLeft, toBuffer } from "ethereumjs-util"

const handler = async (req: BlitzApiRequest, res: BlitzApiResponse) => {
  const imei = req.body.imei
  const privateKey = req.body.privateKey
  const requestData: SensorData = JSON.parse(req.body.data)
  console.log(requestData)
  const sensorData = SensorData.create(requestData)
  const data = Buffer.from(SensorData.encode(sensorData).finish())
  const timestamp = 1627612645
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
    try {
      const response = await client?.publish(`device/${imei}/data`, pkg)
      console.log(response)
      await client?.end()
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
