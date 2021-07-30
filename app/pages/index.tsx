import { Suspense } from "react"
import { Link, BlitzPage, useMutation, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import { observer, useLocalObservable } from "mobx-react-lite"
import awsIot from "aws-iot-device-sdk"
import { publicConfig } from "app/core/config/public"
import { axios } from "app/lib/axios"
import {
  Box,
  Button,
  Divider,
  Flex,
  IconButton,
  Input,
  Select,
  Switch,
  Text,
} from "@chakra-ui/react"
import { SettingsIcon } from "@chakra-ui/icons"
import { BinPackage, SensorData } from "app/protogen/pebble"
import { InputPrivateKeyDialog } from "app/components/InputPrivateKey"
import toast from "react-hot-toast"

const RandomValue = "Random Value"
const ConstValue = "Const Value"

const Home: BlitzPage = observer(() => {
  const GPSROUTES = [
    { name: "ROME-MILAN", id: 0, latitude: 20000, longitude: 2000 },
    { name: "ROME-MILAN2", id: 1, latitude: 20001, longitude: 2001 },
    { name: "ROME-MILAN3", id: 2, latitude: 20002, longitude: 2002 },
  ]

  const RandomORConstValue = [
    { name: RandomValue, id: 1 },
    { name: ConstValue, id: 2 },
  ]
  // latitude longitude tempture GasResistance SNR vbat pressure humidity light temperature2 timestamp random

  const store = useLocalObservable(() => ({
    inputPrivateKeyDialogVisible: false,
    transmitLoading: false,
    buttonEnable: true,
    columnEnables: Array(13).fill(true) as boolean[],
    formatType: null as unknown as string,
    latitude: null as unknown as number,
    longitude: null as unknown as number,
    gyroscope: [],
    accelerometer: [],
    random: "",
    columnTypes: [
      { random: true, value: { max: "40", min: "20", value: "20" } },
      { random: true, value: { max: "40", min: "20", value: "20" } },
      { random: true, value: { max: "40", min: "20", value: "20" } },
      { random: true, value: { max: "40", min: "20", value: "20" } },
      { random: true, value: { max: "40", min: "20", value: "20" } },
      { random: true, value: { max: "40", min: "20", value: "20" } },
      { random: true, value: { max: "40", min: "20", value: "20" } },
      { random: true, value: { max: "40", min: "20", value: "20" } },
      { random: true, value: { max: "40", min: "20", value: "20" } },
      { random: true, value: { max: "40", min: "20", value: "20" } },
    ],
    columnItems: [
      "Temperature",
      "GasResistance",
      "SNR",
      "vbat",
      "pressure",
      "humidity",
      "light",
      "temperature2",
      "timestamp",
      "random",
    ],
    rows: "100",
    genRandom(nn: string, mm: string) {
      const n = parseInt(nn)
      const m = parseInt(mm)
      return Math.floor(Math.random() * (m - n + 1)) + n
    },
    genColumnData(col: any) {
      const d = store.columnTypes[col]!.random
        ? store.genRandom(store.columnTypes[col]!.value.max, store.columnTypes[col]!.value.min)
        : store.columnTypes[col]!.value.value
      return `${d}`
    },
    async pushData(privateKey: string, imei: string) {
      const testSENSORDATA = {
        latitude: store.latitude,
        longitude: store.longitude,

        temperature: store.genColumnData(0),
        gasResistance: store.genColumnData(1),
        snr: store.genColumnData(2),
        vbat: store.genColumnData(3),
        pressure: store.genColumnData(4),
        humidity: store.genColumnData(5),
        light: store.genColumnData(6),
        temperature2: store.genColumnData(7),
        timestamp: store.genColumnData(8),
        random: store.genColumnData(9),

        gyroscope: store.gyroscope,
        accelerometer: store.accelerometer,
        eccPubkey:
          "E1B955AEDF34D18921E3DC2133F2B785BA4C40DBC1502A8BF6ECE674B80E25D8822C4686723BBC3CB4A58D881DE053A1444EE1873E5916907D2F8819ECC7A1B6",
      }
      console.log(testSENSORDATA)
      try {
        store.transmitLoading = true
        const response = await axios.post("/api/push", {
          data: JSON.stringify(testSENSORDATA),
          imei: imei,
          privateKey: privateKey,
        })
        store.transmitLoading = false
        console.log(response)
        if (response.data.success) {
          toast.success("Transmit Success")
        } else {
          toast.error(response.data.msg)
        }
      } catch (error) {
        toast.error(error)
        store.transmitLoading = false
      }
    },
    transmit() {
      store.inputPrivateKeyDialogVisible = true
    },
    generate() {
      // store.inputPrivateKeyDialogVisible = true
      store.export_csv(["aaa", "bbb", "ccc"], "test-csv")
    },
    onRandomOrConst(e: any, col: number) {
      store.columnTypes[col - 1]!.random = e.target.value === RandomValue
      store.checckButtonEnable()
    },
    onGPSChange(e: any) {
      const route = GPSROUTES[e.target.value]
      console.log(route)
      store.latitude = route!.latitude
      store.longitude = route!.longitude
    },
    onMaxInputChange(e: any, index: number) {
      if (/^[1-9]\d*$/.test(e.target.value)) {
        store.columnTypes[index]!.value.max = e.target.value
      }
      store.checckButtonEnable()
    },
    onMinInputChange(e: any, index: number) {
      if (/^[1-9]\d*$/.test(e.target.value)) {
        store.columnTypes[index]!.value.min = e.target.value
      }
      store.checckButtonEnable()
    },
    onValueInputChange(e: any, index: number) {
      if (/^[1-9]\d*$/.test(e.target.value)) {
        store.columnTypes[index]!.value.value = e.target.value
        console.log(store.columnTypes[index])
      }
      store.checckButtonEnable()
    },
    checckButtonEnable() {
      store.buttonEnable = true
      for (let index = 0; index < store.columnEnables.length; index++) {
        const enable = store.columnEnables[index]
        if (index === 0) {
          // gps dont't need handle , it perfom defalut gps
        } else if (index >= 11) {
          // gyroscope && Accelerometer
        } else {
          // 1 - 10
          // Temperature - random
          const columnType = store.columnTypes[index - 1]!
          if (enable === true) {
            if (columnType.random === true) {
              if (
                columnType.value.min.length > 0 &&
                columnType.value.max.length > 0 &&
                parseInt(columnType.value.max) > parseInt(columnType.value.min)
              ) {
              } else {
                console.log(columnType.value.min, columnType.value.max)
                store.buttonEnable = false
                break
              }
            } else {
              if (columnType.value.value.length > 0) {
              } else {
                console.log(columnType.value.min, columnType.value.max)
                store.buttonEnable = false
                break
              }
            }
          }
        }
      }
    },
    onRowsChange(e: any) {
      console.log(e.target.value)

      if (/^[1-9]\d*$/.test(e.target.value)) {
        if (e.target.value === "") {
          store.rows = e.target.value
        }
      }
    },
    export_csv: function (data: any, name: string) {
      var uri = "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(data)
      var downloadLink = document.createElement("a")
      downloadLink.href = uri
      downloadLink.download = name + ".csv" || "temp.csv"
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    },
    onEnableChanges(column: number) {
      if (column > 14) {
        return
      }
      let columnEnable = store.columnEnables[column]
      store.columnEnables[column] = !columnEnable
      store.checckButtonEnable()
    },
  }))

  return (
    <Box
      p="10px"
      position="absolute"
      left="50%"
      justify="flex-end"
      css={{ transform: "translateX(-50%)" }}
    >
      <Flex align="start" px="40px" justify="space-between">
        <Flex direction="column">
          <Text fontSize="25px">Verifiable Iot Data &nbsp;</Text>
          <Button w="80px" leftIcon={<SettingsIcon />} background="brandColor" color="white">
            Load
          </Button>
        </Flex>
        <IconButton aria-label="setting" icon={<SettingsIcon />}></IconButton>
      </Flex>
      <Flex direction="column" align="center">
        <Flex direction="column" justify="center" align="center">
          <Flex align="center">
            <Text mr="10px" display="inline">
              column 1
            </Text>
            <Flex
              direction="column"
              mt="20px"
              height="100px"
              w="800px"
              border="1px solid gray"
              shadow="md"
              borderRadius="10px"
              h="160px"
            >
              <Flex p="10px" justify="space-between">
                <Text fontSize="20px">GPS Route</Text>
                <Flex>
                  Enable
                  <Switch
                    onChange={() => store.onEnableChanges(0)}
                    defaultChecked={store.columnEnables[0]}
                    colorScheme="teal"
                    ml="5px"
                  ></Switch>
                </Flex>
              </Flex>
              <Divider />
              <Select
                ml="20px"
                onChange={(e) => {
                  store.onGPSChange(e)
                }}
                w="50%"
                mt="20px"
                placeholder="Select option"
              >
                {GPSROUTES.map((item, index) => {
                  return (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  )
                })}
              </Select>
            </Flex>
          </Flex>
          {store.columnItems.map((item, index) => {
            return (
              <Box key={index}>
                <Flex align="center">
                  <Text mr="10px">column {index + 2}</Text>
                  <Flex
                    direction="column"
                    mt="20px"
                    height="120px"
                    w="800px"
                    border="1px solid gray"
                    shadow="md"
                    borderRadius="10px"
                    h="160px"
                  >
                    <Flex p="10px" justify="space-between">
                      <Text fontSize="20px">{item}</Text>
                      <Flex>
                        Enable
                        <Switch
                          onChange={() => store.onEnableChanges(index + 1)}
                          defaultChecked={store.columnEnables[index + 1]}
                          colorScheme="teal"
                          ml="5px"
                        ></Switch>
                      </Flex>
                    </Flex>
                    <Divider />
                    <Flex px="20px" pt="20px" justify="start" width="100%">
                      <Flex width="50%" align="start" direction="column">
                        <Text>&nbsp;</Text>
                        <Select
                          mt="10px"
                          onChange={(e) => {
                            store.onRandomOrConst(e, index + 1)
                          }}
                          w="50%"
                        >
                          {RandomORConstValue.map((item, index) => {
                            return (
                              <option key={item.id} value={item.name}>
                                {item.name}
                              </option>
                            )
                          })}
                        </Select>
                      </Flex>
                      {store.columnTypes[index]!.random ? (
                        <Flex justify="space-between">
                          <Flex width="25%" align="start" direction="column">
                            <Text>Min</Text>
                            <Input
                              onChange={(e) => {
                                store.onMinInputChange(e, index)
                              }}
                              value={store.columnTypes[index]!.value.min}
                              mt="10px"
                              width="100px"
                              placeholder="20"
                            />
                          </Flex>
                          <Flex width="25%" align="start" direction="column">
                            <Text>Max</Text>
                            <Input
                              onChange={(e) => {
                                store.onMaxInputChange(e, index)
                              }}
                              value={store.columnTypes[index]!.value.max}
                              mt="10px"
                              width="100px"
                              placeholder="20"
                            />
                          </Flex>
                        </Flex>
                      ) : (
                        <Flex width="50%" align="start" direction="column">
                          <Text>Value</Text>
                          <Input
                            onChange={(e) => {
                              store.onValueInputChange(e, index)
                            }}
                            value={store.columnTypes[index]!.value.value}
                            mt="10px"
                            width="100px"
                            placeholder="20"
                          />
                        </Flex>
                      )}
                    </Flex>
                  </Flex>
                </Flex>
              </Box>
            )
          })}

          <Flex align="center">
            <Text mr="10px">column 12</Text>
            <Flex
              direction="column"
              mt="20px"
              pb="10px"
              w="800px"
              border="1px solid gray"
              shadow="md"
              borderRadius="10px"
            >
              <Flex p="10px" justify="space-between">
                <Text fontSize="20px">Gyroscope</Text>
                <Flex>
                  Lock X-Y-Z
                  <Switch colorScheme="teal" ml="5px"></Switch>
                </Flex>
                <Flex>
                  Enable
                  <Switch
                    onChange={() => store.onEnableChanges(11)}
                    defaultChecked={store.columnEnables[11]}
                    colorScheme="teal"
                    ml="5px"
                  ></Switch>
                </Flex>
              </Flex>
              <Divider />
              <Flex justify="space-evenly" width="100%">
                <Flex direction="column">
                  <Flex mt="10px" width="800px" align="center" justify="space-evenly">
                    <Flex align="center">
                      <Text>X</Text>
                      <Select ml="10px" mt="10px" w="200px" placeholder="Random Value">
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                      </Select>
                    </Flex>
                    <Flex width="100px" align="start" direction="column">
                      <Text>Value</Text>
                      <Input width="100px" placeholder="20" />
                    </Flex>
                    <Flex width="100px" align="start" direction="column">
                      <Text>Value</Text>
                      <Input width="100px" placeholder="20" />
                    </Flex>
                  </Flex>
                  <Flex mt="10px" width="800px" align="center" justify="space-evenly">
                    <Flex align="center">
                      <Text>Y</Text>
                      <Select ml="10px" mt="10px" w="200px" placeholder="Random Value">
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                      </Select>
                    </Flex>
                    <Flex width="100px" align="start" direction="column">
                      <Text>Value</Text>
                      <Input width="100px" placeholder="20" />
                    </Flex>
                    <Flex width="100px" align="start" direction="column">
                      <Text>Value</Text>
                      <Input width="100px" placeholder="20" />
                    </Flex>
                  </Flex>
                  <Flex mt="10px" width="800px" align="center" justify="space-evenly">
                    <Flex align="center">
                      <Text>Z</Text>
                      <Select ml="10px" mt="10px" w="200px" placeholder="Random Value">
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                      </Select>
                    </Flex>
                    <Flex width="100px" align="start" direction="column">
                      <Text>Value</Text>
                      <Input width="100px" placeholder="20" />
                    </Flex>
                    <Flex width="100px" align="start" direction="column">
                      <Text>Value</Text>
                      <Input width="100px" placeholder="20" />
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>

        <Flex align="center">
          <Text mr="10px">column 13</Text>
          <Flex
            direction="column"
            mt="20px"
            pb="10px"
            w="800px"
            border="1px solid gray"
            shadow="md"
            borderRadius="10px"
          >
            <Flex p="10px" justify="space-between">
              <Text fontSize="20px">Accelerometer</Text>
              <Flex>
                Lock X-Y-Z
                <Switch colorScheme="teal" ml="5px"></Switch>
              </Flex>
              <Flex>
                Enable
                <Switch
                  onChange={() => store.onEnableChanges(12)}
                  defaultChecked={store.columnEnables[12]}
                  colorScheme="teal"
                  ml="5px"
                ></Switch>
              </Flex>
            </Flex>
            <Divider />
            <Flex justify="space-evenly" width="100%">
              <Flex direction="column">
                <Flex mt="10px" width="800px" align="center" justify="space-evenly">
                  <Flex align="center">
                    <Text>X</Text>
                    <Select ml="10px" mt="10px" w="200px" placeholder="Random Value">
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      <option value="option3">Option 3</option>
                    </Select>
                  </Flex>
                  <Flex width="100px" align="start" direction="column">
                    <Text>Value</Text>
                    <Input width="100px" placeholder="20" />
                  </Flex>
                  <Flex width="100px" align="start" direction="column">
                    <Text>Value</Text>
                    <Input width="100px" placeholder="20" />
                  </Flex>
                </Flex>
                <Flex mt="10px" width="800px" align="center" justify="space-evenly">
                  <Flex align="center">
                    <Text>Y</Text>
                    <Select ml="10px" mt="10px" w="200px" placeholder="Random Value">
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      <option value="option3">Option 3</option>
                    </Select>
                  </Flex>
                  <Flex width="100px" align="start" direction="column">
                    <Text>Value</Text>
                    <Input width="100px" placeholder="20" />
                  </Flex>
                  <Flex width="100px" align="start" direction="column">
                    <Text>Value</Text>
                    <Input width="100px" placeholder="20" />
                  </Flex>
                </Flex>
                <Flex mt="10px" width="800px" align="center" justify="space-evenly">
                  <Flex align="center">
                    <Text>Z</Text>
                    <Select ml="10px" mt="10px" w="200px" placeholder="Random Value">
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      <option value="option3">Option 3</option>
                    </Select>
                  </Flex>
                  <Flex width="100px" align="start" direction="column">
                    <Text>Value</Text>
                    <Input width="100px" placeholder="20" />
                  </Flex>
                  <Flex width="100px" align="start" direction="column">
                    <Text>Value</Text>
                    <Input width="100px" placeholder="20" />
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <Flex
        mt="30px"
        pb="40px"
        position="absolute"
        left="55%"
        align="center"
        justify="flex-start"
        css={{ transform: "translateX(-50%)" }}
        width="800px"
      >
        <Flex align="center">
          <Text>
            # Rows:
            <Input
              mt="10px"
              value={store.rows}
              width="100px"
              onChange={(e) => {
                store.onRowsChange(e)
              }}
              placeholder="20"
            />
          </Text>
        </Flex>
        <Flex ml="20px" direction="row">
          <Text>
            Format:
            <Select
              display="inline-block"
              ml="10px"
              mt="10px"
              w="200px"
              onChange={(e) => {
                store.formatType = e.target.value
              }}
              placeholder="select type"
            >
              <option value="JSON">JSON</option>
              <option value="CSV">CSV</option>
            </Select>
          </Text>
        </Flex>
        <Flex ml="40px">
          <Button color="white" background="brandColor" onClick={store.generate}>
            Generate && Save
          </Button>
          <Button
            disabled={!store.buttonEnable}
            isLoading={store.transmitLoading}
            ml="15px"
            color="white"
            background="brandColor"
            onClick={store.transmit}
          >
            Transmit
          </Button>
        </Flex>
      </Flex>
      <InputPrivateKeyDialog
        isOpen={store.inputPrivateKeyDialogVisible}
        onClose={() => {
          store.inputPrivateKeyDialogVisible = false
        }}
        onInputPrivateKeySuccess={(privateKey, imei) => {
          store.pushData(privateKey, imei)
        }}
      ></InputPrivateKeyDialog>
    </Box>
  )
})

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
