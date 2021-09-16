import { BlitzApiRequest, BlitzApiResponse } from "blitz"
import { ConfirmPackage, SensorData } from "app/protogen/pebble"
import { MqttService } from "app/service"
import { ecsign, sha256, setLengthLeft, toBuffer } from "ethereumjs-util"
import _ from "lodash"

const handler = async (req: BlitzApiRequest, res: BlitzApiResponse) => {
  const imei = req.body.imei
  const privateKey = req.body.privateKey
  const timestamp = _.round(Date.now() / 1000)
  const owner = Buffer.from('F1c84E4C02407f24829e830d345473f748b09ca1', 'hex');
  const hash = sha256(Buffer.concat([owner, setLengthLeft(toBuffer(timestamp), 4)]));

  try {
    const { r, s, v } = ecsign(hash, Buffer.from(privateKey, "hex"))
    const signature = Buffer.concat([r, s]);
    const confirm = {
      owner,
      timestamp,
      signature,
      channel: 0x13
    };

    const pkg = Buffer.from(ConfirmPackage.encode(confirm).finish());
    const client = await MqttService.createClient()
    console.log('pkg', pkg, 'fc71aeF9cDc9f4815F6096a282A39FB56176Cc28')
    try {
      const response = await client?.publish(`device/${imei}/confirm`, pkg)
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
