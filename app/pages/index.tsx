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
    { name: "ROME-MILAN", id: 1 },
    { name: "ROME-MILAN2", id: 2 },
    { name: "ROME-MILAN3", id: 3 },
  ]

  const RandomORConstValue = [
    { name: RandomValue, id: 1 },
    { name: ConstValue, id: 2 },
  ]
  // tempture GasResistance SNR vbat gasResistance pressure humidity light temperature2 timestamp random latitude longitude
  const COLUMN_TYPES = {
    tempture: {
      random: true,
      value: 0,
    },
    GasResistance: {
      random: true,
      value: 0,
    },
    SNR: {
      random: true,
      value: 0,
    },
    vbat: {
      random: true,
      value: 0,
    },
    pressure: {
      random: true,
      value: 0,
    },
    humidity: {
      random: true,
      value: 0,
    },
    light: {
      random: true,
      value: 0,
    },
    temperature2: {
      random: true,
      value: 0,
    },
    timestamp: {
      random: true,
      value: 0,
    },
    latitude: {
      random: true,
      value: 0,
    },
    longitude: {
      random: true,
      value: 0,
    },
  }

  const store = useLocalObservable(() => ({
    inputPrivateKeyDialogVisible: false,
    transmitLoading: false,
    columnEnables: Array(16).fill(true) as boolean[],
    formatType: null as unknown as string,
    gpsRoute: "",
    columnTypes: COLUMN_TYPES,
    rows: "100",
    async pushData(privateKey: string) {
      const testSENSORDATA = {
        message: {
          snr: 19,
          vbat: 4167,
          latitude: 20000,
          longitude: 20000,
          gasResistance: 7745665,
          temperature: 24.389999389648438,
          pressure: 1003,
          humidity: 67.24214935302734,
          light: 0,
          temperature2: 29.3176326751709,
          gyroscope: [-2, 3, 1],
          accelerometer: [-35, 110, 8226],
          timestamp: "1621943329",
          random: "E1915DBE2ACCC9F3",
          eccPubkey:
            "E1B955AEDF34D18921E3DC2133F2B785BA4C40DBC1502A8BF6ECE674B80E25D8822C4686723BBC3CB4A58D881DE053A1444EE1873E5916907D2F8819ECC7A1B6",
        },
        signature: {
          r: "597E7BF0F5C85D7A84C3C409CA358DE3C27A072587C884AE0452BD93D8F72F39",
          s: "ACF44E758925A2454DB1880B31A3B1B11EEAE9BCEE67C423DADF8510B1A244CC",
        },
      }
      try {
        store.transmitLoading = true
        const response = await axios.post("/api/push", {
          data: JSON.stringify(testSENSORDATA.message),
          imei: "103381234567400",
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
      if (col === 1) {
        store.columnTypes.tempture.random = e.target.value === RandomValue
      }
      console.log(col)

      if (col === 2) {
        store.columnTypes.GasResistance.random = e.target.value === RandomValue
      }
    },
    onGPSChange(e: any) {
      store.gpsRoute = e.target.value
    },
    onAllInputChange(e: any) {
      console.log(e.target.value)

      if (/^[1-9]\d*$/.test(e.target.value)) {
        if (e.target.value === "") {
          store.rows = e.target.value
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
      if (column > 16) {
        return
      }
      let columnEnable = store.columnEnables[column]
      store.columnEnables[column] = !columnEnable
      console.log(column)
      console.log(store.columnEnables)
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
                <Text fontSize="20px">Gas Route</Text>
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
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  )
                })}
              </Select>
            </Flex>
          </Flex>
          <Flex align="center">
            <Text mr="10px">column 2</Text>
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
                <Text fontSize="20px">Aimblent Temperature</Text>
                <Flex>
                  Enable
                  <Switch
                    onChange={() => store.onEnableChanges(1)}
                    defaultChecked={store.columnEnables[1]}
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
                      store.onRandomOrConst(e, 1)
                    }}
                    w="50%"
                    placeholder="Select option"
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
                {store.columnTypes.tempture.random ? (
                  <Flex justify="space-between">
                    <Flex width="25%" align="start" direction="column">
                      <Text>Min</Text>
                      <Input mt="10px" width="100px" placeholder="20" />
                    </Flex>
                    <Flex width="25%" align="start" direction="column">
                      <Text>Max</Text>
                      <Input mt="10px" width="100px" placeholder="20" />
                    </Flex>
                  </Flex>
                ) : (
                  <Flex width="50%" align="start" direction="column">
                    <Text>Value</Text>
                    <Input mt="10px" width="100px" placeholder="20" />
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Flex>
          <Flex align="center">
            <Text mr="10px">column 3</Text>
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
                <Text fontSize="20px">Gas Resistance</Text>
                <Flex>
                  Enable
                  <Switch
                    onChange={() => store.onEnableChanges(2)}
                    defaultChecked={store.columnEnables[2]}
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
                      store.onRandomOrConst(e, 2)
                    }}
                    w="50%"
                    placeholder="Select option"
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
                {store.columnTypes.GasResistance.random ? (
                  <Flex justify="space-between">
                    <Flex width="25%" align="start" direction="column">
                      <Text>Min</Text>
                      <Input mt="10px" width="100px" placeholder="20" />
                    </Flex>
                    <Flex width="25%" align="start" direction="column">
                      <Text>Max</Text>
                      <Input mt="10px" width="100px" placeholder="20" />
                    </Flex>
                  </Flex>
                ) : (
                  <Flex width="50%" align="start" direction="column">
                    <Text>Value</Text>
                    <Input mt="10px" width="100px" placeholder="20" />
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Flex>

          <Flex align="center">
            <Text mr="10px">column 4</Text>
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
                <Text fontSize="20px">SNR</Text>
                <Flex>
                  Enable
                  <Switch
                    onChange={() => store.onEnableChanges(3)}
                    defaultChecked={store.columnEnables[3]}
                    colorScheme="teal"
                    ml="5px"
                  ></Switch>
                </Flex>
              </Flex>
              <Divider />
              <Flex px="20px" pt="20px" justify="start" width="100%">
                <Flex width="50%" align="start" direction="column">
                  <Text>&nbsp;</Text>
                  <Select mt="10px" w="50%" placeholder="Select option">
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </Select>
                </Flex>
                <Flex width="50%" align="start" direction="column">
                  <Text>Value</Text>
                  <Input mt="10px" width="100px" placeholder="20" />
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex align="center">
            <Text mr="10px">column 5</Text>
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
                <Text fontSize="20px">vbat</Text>
                <Flex>
                  Enable
                  <Switch
                    onChange={() => store.onEnableChanges(4)}
                    defaultChecked={store.columnEnables[4]}
                    colorScheme="teal"
                    ml="5px"
                  ></Switch>
                </Flex>
              </Flex>
              <Divider />
              <Flex px="20px" pt="20px" justify="start" width="100%">
                <Flex width="50%" align="start" direction="column">
                  <Text>&nbsp;</Text>
                  <Select mt="10px" w="50%" placeholder="Select option">
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </Select>
                </Flex>
                <Flex width="50%" align="start" direction="column">
                  <Text>Value</Text>
                  <Input mt="10px" width="100px" placeholder="20" />
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex align="center">
            <Text mr="10px">column 6</Text>
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
                <Text fontSize="20px">gasResistance</Text>
                <Flex>
                  Enable
                  <Switch
                    onChange={() => store.onEnableChanges(5)}
                    defaultChecked={store.columnEnables[5]}
                    colorScheme="teal"
                    ml="5px"
                  ></Switch>
                </Flex>
              </Flex>
              <Divider />
              <Flex px="20px" pt="20px" justify="start" width="100%">
                <Flex width="50%" align="start" direction="column">
                  <Text>&nbsp;</Text>
                  <Select mt="10px" w="50%" placeholder="Select option">
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </Select>
                </Flex>
                <Flex width="50%" align="start" direction="column">
                  <Text>Value</Text>
                  <Input mt="10px" width="100px" placeholder="20" />
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex align="center">
            <Text mr="10px">column 7</Text>
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
                <Text fontSize="20px">pressure</Text>
                <Flex>
                  Enable
                  <Switch
                    onChange={() => store.onEnableChanges(6)}
                    defaultChecked={store.columnEnables[6]}
                    colorScheme="teal"
                    ml="5px"
                  ></Switch>
                </Flex>
              </Flex>
              <Divider />
              <Flex px="20px" pt="20px" justify="start" width="100%">
                <Flex width="50%" align="start" direction="column">
                  <Text>&nbsp;</Text>
                  <Select mt="10px" w="50%" placeholder="Select option">
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </Select>
                </Flex>
                <Flex width="50%" align="start" direction="column">
                  <Text>Value</Text>
                  <Input mt="10px" width="100px" placeholder="20" />
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex align="center">
            <Text mr="10px">column 8</Text>
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
                <Text fontSize="20px">humidity</Text>
                <Flex>
                  Enable
                  <Switch
                    onChange={() => store.onEnableChanges(7)}
                    defaultChecked={store.columnEnables[7]}
                    colorScheme="teal"
                    ml="5px"
                  ></Switch>
                </Flex>
              </Flex>
              <Divider />
              <Flex px="20px" pt="20px" justify="start" width="100%">
                <Flex width="50%" align="start" direction="column">
                  <Text>&nbsp;</Text>
                  <Select mt="10px" w="50%" placeholder="Select option">
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </Select>
                </Flex>
                <Flex width="50%" align="start" direction="column">
                  <Text>Value</Text>
                  <Input mt="10px" width="100px" placeholder="20" />
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex align="center">
            <Text mr="10px">column 9</Text>
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
                <Text fontSize="20px">light</Text>
                <Flex>
                  Enable
                  <Switch
                    onChange={() => store.onEnableChanges(8)}
                    defaultChecked={store.columnEnables[8]}
                    colorScheme="teal"
                    ml="5px"
                  ></Switch>
                </Flex>
              </Flex>
              <Divider />
              <Flex px="20px" pt="20px" justify="start" width="100%">
                <Flex width="50%" align="start" direction="column">
                  <Text>&nbsp;</Text>
                  <Select mt="10px" w="50%" placeholder="Select option">
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </Select>
                </Flex>
                <Flex width="50%" align="start" direction="column">
                  <Text>Value</Text>
                  <Input mt="10px" width="100px" placeholder="20" />
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex align="center">
            <Text mr="10px">column 10</Text>
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
                <Text fontSize="20px">temperature2</Text>
                <Flex>
                  Enable
                  <Switch
                    onChange={() => store.onEnableChanges(9)}
                    defaultChecked={store.columnEnables[9]}
                    colorScheme="teal"
                    ml="5px"
                  ></Switch>
                </Flex>
              </Flex>
              <Divider />
              <Flex px="20px" pt="20px" justify="start" width="100%">
                <Flex width="50%" align="start" direction="column">
                  <Text>&nbsp;</Text>
                  <Select mt="10px" w="50%" placeholder="Select option">
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </Select>
                </Flex>
                <Flex width="50%" align="start" direction="column">
                  <Text>Value</Text>
                  <Input mt="10px" width="100px" placeholder="20" />
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex align="center">
            <Text mr="10px">column 11</Text>
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
                <Text fontSize="20px">timestamp</Text>
                <Flex>
                  Enable
                  <Switch
                    onChange={() => store.onEnableChanges(10)}
                    defaultChecked={store.columnEnables[10]}
                    colorScheme="teal"
                    ml="5px"
                  ></Switch>
                </Flex>
              </Flex>
              <Divider />
              <Flex px="20px" pt="20px" justify="start" width="100%">
                <Flex width="50%" align="start" direction="column">
                  <Text>&nbsp;</Text>
                  <Select mt="10px" w="50%" placeholder="Select option">
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </Select>
                </Flex>
                <Flex width="50%" align="start" direction="column">
                  <Text>Value</Text>
                  <Input mt="10px" width="100px" placeholder="20" />
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex align="center">
            <Text mr="10px">column 12</Text>
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
                <Text fontSize="20px">random</Text>
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
              <Flex px="20px" pt="20px" justify="start" width="100%">
                <Flex width="50%" align="start" direction="column">
                  <Text>&nbsp;</Text>
                  <Select mt="10px" w="50%" placeholder="Select option">
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </Select>
                </Flex>
                <Flex width="50%" align="start" direction="column">
                  <Text>Value</Text>
                  <Input mt="10px" width="100px" placeholder="20" />
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex align="center">
            <Text mr="10px">column 13</Text>
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
                <Text fontSize="20px">latitude</Text>
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
              <Flex px="20px" pt="20px" justify="start" width="100%">
                <Flex width="50%" align="start" direction="column">
                  <Text>&nbsp;</Text>
                  <Select mt="10px" w="50%" placeholder="Select option">
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </Select>
                </Flex>
                <Flex width="50%" align="start" direction="column">
                  <Text>Value</Text>
                  <Input mt="10px" width="100px" placeholder="20" />
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex align="center">
            <Text mr="10px">column 14</Text>
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
                <Text fontSize="20px">longitude</Text>
                <Flex>
                  Enable
                  <Switch
                    onChange={() => store.onEnableChanges(13)}
                    defaultChecked={store.columnEnables[13]}
                    colorScheme="teal"
                    ml="5px"
                  ></Switch>
                </Flex>
              </Flex>
              <Divider />
              <Flex px="20px" pt="20px" justify="start" width="100%">
                <Flex width="50%" align="start" direction="column">
                  <Text>&nbsp;</Text>
                  <Select mt="10px" w="50%" placeholder="Select option">
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </Select>
                </Flex>
                <Flex width="50%" align="start" direction="column">
                  <Text>Value</Text>
                  <Input mt="10px" width="100px" placeholder="20" />
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex align="center">
            <Text mr="10px">column 15</Text>
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
                <Text fontSize="20px">Acceletometer</Text>
                <Flex>
                  Lock X-Y-Z
                  <Switch colorScheme="teal" ml="5px"></Switch>
                </Flex>
                <Flex>
                  Enable
                  <Switch
                    onChange={() => store.onEnableChanges(14)}
                    defaultChecked={store.columnEnables[14]}
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
          <Text mr="10px">column 16</Text>
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
                  onChange={() => store.onEnableChanges(15)}
                  defaultChecked={store.columnEnables[15]}
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
        onInputPrivateKeySuccess={(privateKey) => {
          store.pushData(privateKey)
        }}
      ></InputPrivateKeyDialog>
    </Box>
  )
})

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
