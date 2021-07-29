import { BlitzApiRequest, BlitzApiResponse } from "blitz"
import { BinPackage, SensorData } from "app/protogen/pebble"
import { MqttService } from "app/service"

const handler = async (req: BlitzApiRequest, res: BlitzApiResponse) => {
  const requestData: SensorData = JSON.parse(req.body.data).message
  console.log(requestData)
  const sensorData = SensorData.create(requestData)
  const data = SensorData.encode(sensorData)
  const timestamp = new Date().getTime()
  const type = BinPackage.PackageType.DATA
  const binPackage = BinPackage.create({
    type: type,
    data: data.finish(),
    timestamp: timestamp,
    signature: new Uint8Array(),
  })
  const payload = BinPackage.encode(binPackage)
  // device.subscribe("device/${imei}/data")
  // device.publish("device/${imei}/data", payload.bytes())

  const client = await MqttService.createClient()
  try {
    const response = await client?.publish(`device/${103381234567402}/data`, JSON.stringify({}))
    console.log(response)
    res.json({ name: "John Doe", success: true })
  } catch (e) {
    console.log(e.toString())
    res.json({ name: "John Doe", success: false })
  }
}
export default handler
