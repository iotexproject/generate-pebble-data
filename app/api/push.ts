import { BlitzApiRequest, BlitzApiResponse } from "blitz"
import awsIot from "aws-iot-device-sdk"
import { publicConfig } from "app/core/config/public"
import { BinPackage, SensorData } from "app/protogen/pebble"
import path from "path"

const handler = (req: BlitzApiRequest, res: BlitzApiResponse) => {
  console.log(path.resolve("app/core/config/tls/root.pem"))
  var device = new awsIot.device({
    keyPath: path.resolve("app/core/config/tls/root.pem"),
    certPath: path.resolve("app/core/config/tls/e62b7b054e-certificate.pem.crt"),
    caPath: path.resolve("app/core/config/tls/e62b7b054e-private.pem.key"),
    host: `${publicConfig.awasurl}:${publicConfig.port}`,
  })

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
  res.json({ name: "John Doe" })
}
export default handler
