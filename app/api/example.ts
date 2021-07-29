import { BlitzApiRequest, BlitzApiResponse } from "blitz"

const handler = (req: BlitzApiRequest, res: BlitzApiResponse) => {
  res.statusCode = 200
  res.json({ name: "John Doe" })
}
export default handler
