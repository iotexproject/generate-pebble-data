import { Suspense } from "react"
import { Link, BlitzPage, useMutation, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import { observer, useLocalObservable } from "mobx-react-lite"
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
import { InputPrivateKeyDialog } from "app/components/InputPrivateKey"
import toast from "react-hot-toast"

const RandomValue = "Random Value"
const ConstValue = "Const Value"

function removeNull(option: object) {
  if (!option) {
    return
  }
  for (var attr in option) {
    if (option[attr] === null) {
      delete option[attr]
      continue
    }
    if (typeof option[attr] == "object") {
      removeNull(option[attr])
    }
  }
}

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
    columnEnables: Array(12).fill(true) as boolean[],
    formatType: null as unknown as string,
    latitude: GPSROUTES[0]!.latitude,
    longitude: GPSROUTES[0]!.longitude,
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
    ],
    gyroscopeColumnTypes: [
      { random: true, value: { max: "40", min: "20", value: "20" } },
      { random: true, value: { max: "40", min: "20", value: "20" } },
      { random: true, value: { max: "40", min: "20", value: "20" } },
    ],

    AccelerometerColumnTypes: [
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
      "random",
    ],
    rows: "100",
    genRandom(nn: string, mm: string) {
      const n = parseInt(nn)
      const m = parseInt(mm)
      return Math.floor(Math.random() * (m - n + 1)) + n
    },
    genColumnData(col: any) {
      if (store.columnEnables[col + 1]) {
        const d = store.columnTypes[col]!.random
          ? store.genRandom(store.columnTypes[col]!.value.max, store.columnTypes[col]!.value.min)
          : parseInt(store.columnTypes[col]!.value.value)
        return d
      }
      return null
    },
    genGyroscope() {
      const array = new Array<number>()
      console.log(store.columnEnables[10])

      if (store.columnEnables[10]) {
        //gy
        for (let index = 0; index < store.gyroscopeColumnTypes.length; index++) {
          const element = store.gyroscopeColumnTypes[index]
          const d = store.gyroscopeColumnTypes[index]!.random
            ? store.genRandom(
                store.gyroscopeColumnTypes[index]!.value.max,
                store.gyroscopeColumnTypes[index]!.value.min
              )
            : parseInt(store.gyroscopeColumnTypes[index]!.value.value)
          array.push(d)
        }
        return array
      }
      return null
    },
    genAccelerometer() {
      const array = new Array<number>()
      if (store.columnEnables[11]) {
        //gy
        for (let index = 0; index < store.AccelerometerColumnTypes.length; index++) {
          const element = store.AccelerometerColumnTypes[index]

          const d = store.AccelerometerColumnTypes[index]!.random
            ? store.genRandom(
                store.AccelerometerColumnTypes[index]!.value.max,
                store.AccelerometerColumnTypes[index]!.value.min
              )
            : parseInt(store.AccelerometerColumnTypes[index]!.value.value)
          array.push(d)
        }
        return array
      }
      return null
    },
    async pushData(privateKey: string, imei: string) {
      const data = {
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
        timestamp: new Date().getTime(),
        random: store.genColumnData(8),
        gyroscope: store.genGyroscope(),
        accelerometer: store.genAccelerometer(),
      }
      const filterData = removeNull(data)
      console.log(filterData)
      try {
        store.transmitLoading = true
        const response = await axios.post("/api/push", {
          data: JSON.stringify(filterData),
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
    onGyroscopeRandomOrConst(e: any, col: number) {
      store.gyroscopeColumnTypes[col]!.random = e.target.value === RandomValue
      store.checckButtonEnable()
    },

    onAccelerometerRandomOrConst(e: any, col: number) {
      store.AccelerometerColumnTypes[col]!.random = e.target.value === RandomValue
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
      if (index < 10) {
        if (/^[1-9]\d*$/.test(e.target.value)) {
          store.columnTypes[index]!.value.min = e.target.value
        }
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

    onGyroscopeMaxInputChange(e: any, index: number) {
      if (/^[1-9]\d*$/.test(e.target.value)) {
        store.gyroscopeColumnTypes[index]!.value.max = e.target.value
      }
      store.checckButtonEnable()
    },
    onGyroscopeMinInputChange(e: any, index: number) {
      if (/^[1-9]\d*$/.test(e.target.value)) {
        store.gyroscopeColumnTypes[index]!.value.min = e.target.value
      }
      store.checckButtonEnable()
    },
    onGyroscopeInputChange(e: any, index: number) {
      if (/^[1-9]\d*$/.test(e.target.value)) {
        store.gyroscopeColumnTypes[index]!.value.value = e.target.value
      }
      store.checckButtonEnable()
    },
    onAccelerometeMaxInputChange(e: any, index: number) {
      if (/^[1-9]\d*$/.test(e.target.value)) {
        store.AccelerometerColumnTypes[index]!.value.max = e.target.value
        console.log(store.AccelerometerColumnTypes)
      }
      store.checckButtonEnable()
    },
    onAccelerometerMinInputChange(e: any, index: number) {
      if (/^[1-9]\d*$/.test(e.target.value)) {
        store.AccelerometerColumnTypes[index]!.value.min = e.target.value
      }
      store.checckButtonEnable()
    },
    onAccelerometeInputChange(e: any, index: number) {
      if (/^[1-9]\d*$/.test(e.target.value)) {
        store.AccelerometerColumnTypes[index]!.value.value = e.target.value
      }
      store.checckButtonEnable()
    },
    checckButtonEnable() {
      store.buttonEnable = true
      for (let index = 0; index < store.columnEnables.length; index++) {
        const enable = store.columnEnables[index]
        if (index === 0) {
          // gps dont't need handle , it perfom defalut gps
        } else if (index >= 10) {
          // gyroscope && Accelerometer
          if (index === 10) {
            for (
              let gyroscopeIndex = 0;
              gyroscopeIndex < store.gyroscopeColumnTypes.length;
              gyroscopeIndex++
            ) {
              const columnType = store.gyroscopeColumnTypes[gyroscopeIndex]!
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
                    store.buttonEnable = false
                    break
                  }
                }
              }
            }
          }
          if (index === 11) {
            for (
              let accelerometerIndex = 0;
              accelerometerIndex < store.AccelerometerColumnTypes.length;
              accelerometerIndex++
            ) {
              const columnType = store.AccelerometerColumnTypes[accelerometerIndex]!
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
        } else {
          // 1 - 9
          // Temperature - random
          console.log(index)

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
      if (/^[1-9]\d*$/.test(e.target.value)) {
        store.rows = e.target.value
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
      if (column > 12) {
        return
      }
      console.log(column)

      let columnEnable = store.columnEnables[column]
      store.columnEnables[column] = !columnEnable
      store.checckButtonEnable()
    },
  }))

  return (
    <Box p="10px" minW="1000px">
      <Flex justifyContent="center" justify="space-between">
        <Flex direction="column">
          <Text align="center" fontSize="25px">
            Verifiable Iot Data &nbsp;
          </Text>
          {/* <Button
            hidden={true}
            w="80px"
            leftIcon={<SettingsIcon />}
            background="brandColor"
            color="white"
          >
            Load
          </Button> */}
        </Flex>
        {/* <IconButton aria-label="setting" icon={<SettingsIcon />}></IconButton> */}
      </Flex>
      <Flex direction="column" align="center">
        <Flex direction="column" justify="center" align="center">
          <Flex align="center">
            <Box mr="10px">column 1</Box>
            <Flex
              direction="column"
              mt="20px"
              height="100px"
              border="1px solid gray"
              shadow="md"
              minW="800px"
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
                placeholder={GPSROUTES[0]?.name}
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
                    minW="800px"
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
            <Text mr="10px">column 11</Text>
            <Flex
              direction="column"
              mt="20px"
              pb="10px"
              minW="800px"
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
                    onChange={() => store.onEnableChanges(10)}
                    defaultChecked={store.columnEnables[10]}
                    colorScheme="teal"
                    ml="5px"
                  ></Switch>
                </Flex>
              </Flex>
              <Divider />
              <Flex width="100%">
                <Flex direction="column" width="100%" px="20px">
                  {store.gyroscopeColumnTypes.map((item, index) => {
                    return (
                      <Flex key={index} pt="20px" justify="start" width="100%">
                        <Flex width="50%" align="start" direction="column">
                          <Text ml="50px">{index === 0 ? "X" : index === 1 ? "Y" : "Z"}</Text>
                          <Select
                            mt="10px"
                            onChange={(e) => {
                              store.onGyroscopeRandomOrConst(e, index)
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
                        {store.gyroscopeColumnTypes[index]!.random ? (
                          <Flex justify="space-between">
                            <Flex width="25%" align="start" direction="column">
                              <Text>Min</Text>
                              <Input
                                onChange={(e) => {
                                  store.onGyroscopeMinInputChange(e, index)
                                }}
                                value={store.gyroscopeColumnTypes[index]!.value.min}
                                mt="10px"
                                width="100px"
                                placeholder="20"
                              />
                            </Flex>
                            <Flex width="25%" align="start" direction="column">
                              <Text>Max</Text>
                              <Input
                                onChange={(e) => {
                                  store.onGyroscopeMaxInputChange(e, index)
                                }}
                                value={store.gyroscopeColumnTypes[index]!.value.max}
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
                                store.onGyroscopeInputChange(e, index)
                              }}
                              value={store.gyroscopeColumnTypes[index]!.value.value}
                              mt="10px"
                              width="100px"
                              placeholder="20"
                            />
                          </Flex>
                        )}
                      </Flex>
                    )
                  })}
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>

        <Flex align="center">
          <Text mr="10px">column 12</Text>
          <Flex
            direction="column"
            mt="20px"
            pb="10px"
            minW="800px"
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
                  onChange={() => store.onEnableChanges(11)}
                  defaultChecked={store.columnEnables[11]}
                  colorScheme="teal"
                  ml="5px"
                ></Switch>
              </Flex>
            </Flex>
            <Divider />
            <Flex justify="space-evenly" width="100%">
              <Flex direction="column" width="100%">
                {store.AccelerometerColumnTypes.map((item, index) => {
                  return (
                    <Flex px="20px" key={index} pt="20px" justify="start" width="100%">
                      <Flex width="50%" align="start" direction="column">
                        <Text>&nbsp;</Text>
                        <Select
                          mt="10px"
                          onChange={(e) => {
                            store.onAccelerometerRandomOrConst(e, index)
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
                      {store.AccelerometerColumnTypes[index]!.random ? (
                        <Flex justify="space-between">
                          <Flex width="25%" align="start" direction="column">
                            <Text>Min</Text>
                            <Input
                              onChange={(e) => {
                                store.onAccelerometerMinInputChange(e, index)
                              }}
                              value={store.AccelerometerColumnTypes[index]!.value.min}
                              mt="10px"
                              width="100px"
                              placeholder="20"
                            />
                          </Flex>
                          <Flex width="25%" align="start" direction="column">
                            <Text>Max</Text>
                            <Input
                              onChange={(e) => {
                                store.onAccelerometeMaxInputChange(e, index)
                              }}
                              value={store.AccelerometerColumnTypes[index]!.value.max}
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
                              store.onAccelerometeInputChange(e, index)
                            }}
                            value={store.AccelerometerColumnTypes[index]!.value.value}
                            mt="10px"
                            width="100px"
                            placeholder="20"
                          />
                        </Flex>
                      )}
                    </Flex>
                  )
                })}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <Flex mt="30px" pb="40px" align="center" justify="center" w="100%">
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
          <Button
            color="white"
            background="brandColor"
            onClick={store.generate}
            disabled={!store.buttonEnable || store.rows.length === 0 || store.formatType === null}
          >
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
