import { Suspense } from "react"
import { Link, BlitzPage, useMutation, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import { observer, useLocalObservable } from "mobx-react-lite"
import { axios } from "app/lib/axios"
import XLSX from "xlsx"
import { gpsRoutes } from "../gpsRoutes/index"
import { Box, Button, Divider, Flex, Input, Select, Switch, Text } from "@chakra-ui/react"
import { InputPrivateKeyDialog } from "app/components/InputPrivateKey"
import toast from "react-hot-toast"
import { DateTimePicker } from "react-rainbow-components"
import moment from "moment"
import Upload from "rc-upload"

const RandomValue = "Random Value"
const ConstValue = "Const Value"

const MAP_API_KEY = "5b3ce3597851110001cf62483c2ad04dbf1048b187a375a7902bdec7"
const MAP_URL = "https://api.openrouteservice.org"
const SEARCH_GEOCODE = `${MAP_URL}/geocode/search`
const GEOJSON = `${MAP_URL}/v2/directions/foot-walking`

const Home: BlitzPage = observer(() => {
  const RandomORConstValue = [
    { name: RandomValue, id: 1 },
    { name: ConstValue, id: 2 },
  ]

  const store = useLocalObservable(() => ({
    inputPrivateKeyDialogVisible: false,
    transmitLoading: false,
    buttonEnable: true,
    columnEnables: Array(12).fill(true) as boolean[],
    formatType: null as unknown as string,
    coordinates: gpsRoutes[0]?.coordinates,
    gyroscope: [],
    accelerometer: [],
    random: "",
    startTime: moment(new Date()).subtract(7, "d").format("YYYY-MM-DD HH:mm:ss"),
    endTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
    searchFeatures: new Array(),
    searchEndFeatures: new Array(),
    type: "Range",
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
    objKey: [
      "temperature",
      "gasResistance",
      "snr",
      "vbat",
      "pressure",
      "humidity",
      "light",
      "temperature2",
      "random",
    ],
    startPlace: "",
    startSite: new Array(),
    endPlace: "",
    endSite: new Array(),
    rows: gpsRoutes[0]?.coordinates.length,
    gpsRoute: 0,
    genRandom(nn: string, mm: string) {
      const n = parseFloat(nn)
      const m = parseFloat(mm)
      return Math.floor(Math.random() * (m - n + 1)) + n
    },
    genColumnData(col: any) {
      if (store.columnEnables[col + 1]) {
        const d = store.columnTypes[col]!.random
          ? store.genRandom(store.columnTypes[col]!.value.max, store.columnTypes[col]!.value.min)
          : parseFloat(store.columnTypes[col]!.value.value)
        return `${d}`
      }
      return null
    },
    genGyroscope() {
      const array = new Array<number>()

      if (store.columnEnables[10]) {
        //gy
        for (let index = 0; index < store.gyroscopeColumnTypes.length; index++) {
          const element = store.gyroscopeColumnTypes[index]
          const d = store.gyroscopeColumnTypes[index]!.random
            ? store.genRandom(
                store.gyroscopeColumnTypes[index]!.value.max,
                store.gyroscopeColumnTypes[index]!.value.min
              )
            : parseFloat(store.gyroscopeColumnTypes[index]!.value.value)
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
            : parseFloat(store.AccelerometerColumnTypes[index]!.value.value)
          array.push(d)
        }
        return array
      }
      return null
    },
    genPushData(index: any) {
      console.log(store.genGyroscope())
      const diff =
        (moment(store.endTime).unix() - moment(store.startTime).unix()) / Number(store.rows)
      const data = {
        // @ts-ignore
        latitude: store.coordinates[index][1],
        // @ts-ignore
        longitude: store.coordinates[index][0],
        temperature: store.genColumnData(0),
        gasResistance: store.genColumnData(1),
        snr: store.genColumnData(2),
        vbat: store.genColumnData(3),
        pressure: store.genColumnData(4),
        humidity: store.genColumnData(5),
        light: store.genColumnData(6),
        temperature2: store.genColumnData(7),
        timestamp: `${moment(store.startTime).unix() + diff * index}`,
        random: store.genColumnData(8),
        gyroscope: store.genGyroscope(),
        accelerometer: store.genAccelerometer(),
      }
      return data
    },
    async pushData(privateKey: string, imei: string) {
      const rows = Number(store.rows)
      // let genData = new Array()
      for (let index = 0; index < rows; index++) {
        // const data = store.genPushData(index)
        const genData = store.genPushData(index)
        console.log("genData", genData)
        try {
          store.transmitLoading = true
          const response = await axios.post("/api/push", {
            data: JSON.stringify(genData),
            imei: imei,
            privateKey: privateKey,
          })
          store.transmitLoading = false
          if (response.data.success) {
            toast.success("Transmit Success")
          } else {
            toast.error(response.data.msg)
          }
        } catch (error) {
          toast.error(error)
          store.transmitLoading = false
        }
      }
    },
    transmit() {
      store.inputPrivateKeyDialogVisible = true
    },
    generate() {
      if (store.formatType === "JSON") {
        const rows = Number(store.rows)
        let genData = new Array()
        for (let index = 0; index < rows; index++) {
          const data = store.genPushData(index)
          genData.push(data)
        }
        store.saveJSON(
          genData,
          `${moment(store.startTime).format("YYYY/MM/DD")}-${moment(store.endTime).format(
            "YYYY/MM/DD"
          )}.json`
        )
      }
      if (store.formatType === "CSV") {
        const rows = Number(store.rows)
        // const genData = Array(rows).fill(data)
        let genData = new Array<Array<any>>()
        for (let index = 0; index < rows; index++) {
          var arr = []
          const data = store.genPushData(index)
          for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
              const element = data[key]
              if (Array.isArray(element)) {
                //@ts-ignore
                arr.push(element.join(","))
              } else {
                //@ts-ignore
                arr.push(element)
              }
            }
          }
          genData.push(arr)
        }
        const data = store.genPushData(0)
        genData.unshift(Object.keys(data))
        var filename = `${moment(store.startTime).format("YYYY/MM/DD")}-${moment(
          store.endTime
        ).format("YYYY/MM/DD")}.csv` //文件名称
        var ws_name = "Sheet1" //Excel第一个sheet的名称
        var wb = XLSX.utils.book_new()
        var ws = XLSX.utils.aoa_to_sheet(genData)
        XLSX.utils.book_append_sheet(wb, ws, ws_name) //将数据添加到工作薄
        XLSX.writeFile(wb, filename) //导出Exce
      }
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
      store.type = "Range"
      // @ts-ignore
      store.coordinates = gpsRoutes[e.target.value]?.coordinates
      store.rows = store.coordinates?.length
      store.gpsRoute = e.target.value
    },
    onMaxInputChange(e: any, index: number) {
      if (!isNaN(Number(e.target.value))) {
        store.columnTypes[index]!.value.max = e.target.value
      }
      store.checckButtonEnable()
    },
    onMinInputChange(e: any, index: number) {
      if (index < 10) {
        if (!isNaN(Number(e.target.value))) {
          store.columnTypes[index]!.value.min = e.target.value
        }
      }
      store.checckButtonEnable()
    },
    onValueInputChange(e: any, index: number) {
      if (!isNaN(Number(e.target.value))) {
        store.columnTypes[index]!.value.value = e.target.value
      }
      store.checckButtonEnable()
    },
    onGyroscopeMaxInputChange(e: any, index: number) {
      if (!isNaN(Number(e.target.value))) {
        store.gyroscopeColumnTypes[index]!.value.max = e.target.value
      }
      store.checckButtonEnable()
    },
    onGyroscopeMinInputChange(e: any, index: number) {
      if (!isNaN(Number(e.target.value))) {
        store.gyroscopeColumnTypes[index]!.value.min = e.target.value
      }
      store.checckButtonEnable()
    },
    onGyroscopeInputChange(e: any, index: number) {
      if (!isNaN(Number(e.target.value))) {
        store.gyroscopeColumnTypes[index]!.value.value = e.target.value
      }
      store.checckButtonEnable()
    },
    onAccelerometeMaxInputChange(e: any, index: number) {
      if (!isNaN(Number(e.target.value))) {
        store.AccelerometerColumnTypes[index]!.value.max = e.target.value
      }
      store.checckButtonEnable()
    },
    onAccelerometerMinInputChange(e: any, index: number) {
      if (!isNaN(Number(e.target.value))) {
        store.AccelerometerColumnTypes[index]!.value.min = e.target.value
      }
      store.checckButtonEnable()
    },
    onAccelerometeInputChange(e: any, index: number) {
      if (!isNaN(Number(e.target.value))) {
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
                    parseFloat(columnType.value.max) > parseFloat(columnType.value.min)
                  ) {
                  } else {
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
                    parseFloat(columnType.value.max) > parseFloat(columnType.value.min)
                  ) {
                  } else {
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
        } else {
          // 1 - 9
          // Temperature - random

          const columnType = store.columnTypes[index - 1]!
          if (enable === true) {
            if (columnType.random === true) {
              if (
                columnType.value.min.length > 0 &&
                columnType.value.max.length > 0 &&
                parseFloat(columnType.value.max) > parseFloat(columnType.value.min)
              ) {
              } else {
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
    exportCsv(headers: Array<any>, rows: any, filename: string) {
      if (Array.isArray(headers) && headers.length > 0) {
        //表头信息不能为空
        if (!filename || typeof filename != "string") {
          filename = "export.csv"
        }

        let blob = store.getCsvBlob(headers, rows)
        let url = URL.createObjectURL(blob)
        let downloadLink = document.createElement("a")
        downloadLink.href = url
        downloadLink.download = filename
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        URL.revokeObjectURL(url)
      }
    },
    getCsvBlob(headers, rows) {
      const BOM = "\uFEFF"
      let columnDelimiter = "," //默认列分隔符','
      let rowDelimiter = "\r\n" //默认行分隔符 '\r\n'
      let csv = headers.reduce((previous, header) => {
        return (previous ? previous + columnDelimiter : "") + (header.title || header.column)
      }, "")
      if (Array.isArray(rows) && rows.length > 0) {
        let columns = headers.map((header) => header.column)
        csv = rows.reduce((previous, row) => {
          let rowCsv = columns.reduce((pre, column) => {
            if (row.hasOwnProperty(column)) {
              let cell = row[column]
              if (cell != null) {
                let header = headers.find((item) => item.column == column)
                if (header.formatter != null && typeof header.formatter == "function") {
                  cell = header.formatter(cell)
                }
                if (cell != null) {
                  cell = cell.toString().replace(new RegExp(rowDelimiter, "g"), " ") // 若数据中本来就含行分隔符，则用' '替换
                  cell = new RegExp(columnDelimiter).test(cell) ? `"${cell}"` : cell //若数据中本来就含列分隔符，则用""包起来
                  return pre ? pre + columnDelimiter + cell : pre + cell
                }
              }
              return pre ? pre + columnDelimiter : pre + " " //reduce初始值为''，故第一次迭代时不会在行首加列分隔符。后面的遇到值为空或不存在的列要填充含空格的空白" ",则pre返回true，会加列分隔符
            } else {
              return pre ? pre + columnDelimiter : pre + " " //即使不存在该列也要填充空白，避免数据和表头错位不对应
            }
          }, "")
          return previous + rowDelimiter + rowCsv
        }, csv)
      }
      let blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" })
      return blob
    },
    saveJSON(data: any, filename: string) {
      if (!data) {
        return
      }
      if (!filename) filename = "generate.json"
      if (typeof data === "object") {
        data = JSON.stringify(data, undefined, 4)
      }
      var blob = new Blob([data], { type: "text/json" }),
        e = document.createEvent("MouseEvents"),
        a = document.createElement("a")
      a.download = filename
      a.href = window.URL.createObjectURL(blob)
      a.dataset.downloadurl = ["text/json", a.download, a.href].join(":")
      e.initMouseEvent(
        "click",
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      )
      a.dispatchEvent(e)
    },
    onEnableChanges(column: number) {
      if (column > 12) {
        return
      }

      let columnEnable = store.columnEnables[column]
      store.columnEnables[column] = !columnEnable
      store.checckButtonEnable()
    },
    onChangeStartTime(value) {
      store.startTime = value
    },
    onChangeEndTime(value) {
      store.endTime = value
    },
    onChangeStartPlace(e) {
      store.startPlace = e.target.value
      if (store.startPlace !== "") {
        this.searchGeocode(store.startPlace)
      } else {
        store.startSite = []
      }
    },
    onChangeEndPlace(e) {
      store.endPlace = e.target.value
      if (store.endPlace !== "") {
        this.searchEndGeocode(store.endPlace)
      } else {
        store.endSite = []
      }
    },
    searchGeocode(value) {
      axios.get(`${SEARCH_GEOCODE}?api_key=${MAP_API_KEY}&text=${value}`).then((res) => {
        // @ts-ignore
        store.searchFeatures = res.data.features
      })
    },
    searchEndGeocode(value) {
      axios.get(`${SEARCH_GEOCODE}?api_key=${MAP_API_KEY}&text=${value}`).then((res) => {
        // @ts-ignore
        store.searchEndFeatures = res.data.features
      })
    },
    getCoordinates() {
      store.type = "Path"
      if (store.startSite.length === 0 || store.endSite.length === 0) {
        toast.error("Start Place and End Place Not Empty")
        return false
      }
      axios
        .get(
          `${GEOJSON}?api_key=${MAP_API_KEY}&start=${store.startSite.join(
            ","
          )}&end=${store.endSite.join(",")}`
        )
        .then((res) => {
          store.coordinates = res.data.features[0].geometry.coordinates
          store.rows = Number(store.coordinates?.length)
        })
        .catch((err) => {
          toast.error(err.response.data.error.message)
          store.rows = 0
          store.coordinates = []
          store.endPlace = ""
          store.endSite = []
        })
    },
    onImportExcel: (file) => {
      // 获取上传的文件对象
      const files = file

      // 通过FileReader对象读取文件
      const fileReader = new FileReader()
      fileReader.onload = (event) => {
        try {
          // @ts-ignore
          const { result } = event.target
          const workbook = XLSX.read(result, { type: "binary" })
          let data = []
          for (const sheet in workbook.Sheets) {
            if (workbook.Sheets.hasOwnProperty(sheet)) {
              // @ts-ignore
              data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]))
            }
          }
          toast.success("Parsed successfully")
          store.parsedData(data)
        } catch (e) {
          toast.error("Parsing failed")
        }
      }
      fileReader.readAsBinaryString(files)
    },
    parsedData: (data) => {
      console.log("parsedData", data)
      store.rows = data.length
      store.type = "Path"
      store.formatType = "CSV"
      store.startSite = [data[0].longitude, data[0].latitude]
      store.endSite = [data[data.length - 1].longitude, data[data.length - 1].latitude]
      store.startTime = moment(data[0].timestamp * 1000).format("YYYY-MM-DD HH:mm:ss")
      store.endTime = moment(data[data.length - 1].timestamp * 1000).format("YYYY-MM-DD HH:mm:ss")
      const maps = new Array()
      data.map((item) => {
        maps.push([item.longitude, item.latitude])
      })
      store.coordinates = maps
      store.parsedMinMax(data)
    },
    parsedMinMax: (data) => {
      store.columnTypes.forEach((item, index) => {
        const min = Math.min.apply(
          Math,
          data.map((o) => {
            return o[`${store.objKey[index]}`]
          })
        )
        const max = Math.max.apply(
          Math,
          data.map((o) => {
            return o[`${store.objKey[index]}`]
          })
        )
        if (min === max) {
          item.random = false
          item.value.value = min
        } else {
          item.value.min = min
          item.value.max = max
        }
      })
      store.gyroscopeColumnTypes.forEach((item, index) => {})
    },
  }))

  const uploadProps = {
    multiple: true,
    accept: ".csv",
    beforeUpload(file) {
      console.log(file, file.name)
      store.onImportExcel(file)
      return false
    },
    onStart(file) {
      console.log("onStart", file, file.name)
    },
    onSuccess(ret) {
      console.log("onSuccess", ret)
    },
    onError(err) {
      console.log("onError", err)
    },
  }

  return (
    <Box px="2.5vw" pb="10vw">
      <Text align="center" fontSize="25px" py="10px">
        Trustream Data Generator &nbsp;
      </Text>
      <Flex
        mt="30px"
        align="center"
        justify="center"
        w="100%"
        flexDirection={{ base: "column", lg: "row" }}
        justifyContent="space-between"
      >
        <Flex align="center">
          <Text fontSize="1rem" fontWeight="semibold" mr="10px">
            Rows:
          </Text>
          <Input
            w="100px"
            value={store.rows}
            onChange={(e) => {
              store.onRowsChange(e)
            }}
            placeholder="20"
            type="number"
          />
          <Text fontSize="1rem" fontWeight="semibold" ml="20px" mr="10px">
            Format:
          </Text>
          <Select
            display="inline-block"
            w="200px"
            onChange={(e) => {
              console.log(e.target.value)
              store.formatType = e.target.value
            }}
            value={store.formatType}
            placeholder="select type"
          >
            <option value="JSON">JSON</option>
            <option value="CSV">CSV</option>
          </Select>
          <Upload {...uploadProps}>
            <Button color="white" ml="20px" background="brandColor" onClick={store.generate}>
              Import
            </Button>
          </Upload>
        </Flex>
        <Flex ml="40px">
          <Button
            color="white"
            background="brandColor"
            onClick={store.generate}
            disabled={
              !store.buttonEnable ||
              store.rows === 0 ||
              store.formatType === null ||
              store.coordinates?.length === 0
            }
          >
            Generate & Download
          </Button>
          <Button
            disabled={!store.buttonEnable}
            isLoading={store.transmitLoading}
            ml="15px"
            color="white"
            background="brandColor"
            onClick={store.transmit}
          >
            Submit to Trustream
          </Button>
        </Flex>
      </Flex>
      <Flex
        direction="column"
        mt="2rem"
        height="100px"
        border="1px solid gray"
        shadow="md"
        w="100%"
        borderRadius="10px"
        h="250px"
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
        <Text fontSize="0.875rem" color="red" ml="20px" mt="10px">
          Note: There is only one way to create a GPS Route, Select Range Place or use Start Place
          and End Place
        </Text>
        <Flex justifyContent="space-between" flex="1">
          <Flex
            flexDirection="column"
            pt="20px"
            px="20px"
            justifyContent="flex-start"
            alignItems="flex-start"
          >
            <Text>Select Range Place</Text>
            <Select
              onChange={(e) => {
                store.onGPSChange(e)
              }}
              w="20vw"
              mt="10px"
              value={store.gpsRoute}
            >
              {gpsRoutes.map((item, index) => {
                return (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                )
              })}
            </Select>
            {store.coordinates?.length !== 0 && store.type === "Range" && (
              <Text mt="10px">Range Coordinates Total: {store.coordinates?.length}</Text>
            )}
          </Flex>
          <Flex flex="1" px="20px" justifyContent="flex-start" alignItems="flex-start" pt="20px">
            <Flex alignItems="flex-start" flexDirection="column" mr="20px" position="relative">
              <Text>Start Place</Text>
              <Input
                onChange={store.onChangeStartPlace}
                value={store.startPlace}
                width="20vw"
                placeholder="Pleace Enter Starting place"
                mt="10px"
              />
              {store.startSite.length !== 0 && (
                <Text mt="10px">
                  Location: {store.startSite[0]}, {store.startSite[1]}
                </Text>
              )}
              {store.coordinates?.length !== 0 && store.type === "Path" && (
                <Text mt="10px">Path Coordinates Total: {store.coordinates?.length}</Text>
              )}
              {store.searchFeatures.length !== 0 && (
                <Flex
                  w="100%"
                  position="absolute"
                  flexDirection="column"
                  top="80px"
                  bg="white"
                  border="1px"
                  borderColor="#eee"
                  maxH="300px"
                  overflow="auto"
                  zIndex="22"
                >
                  {store.searchFeatures.map((item) => {
                    return (
                      <Text
                        fontSize="xs"
                        cursor="pointer"
                        p="10px"
                        css={{
                          "&:hover": {
                            background: "#eee",
                          },
                        }}
                        key={item.properties.id}
                        onClick={() => {
                          store.startPlace = item.properties.label
                          store.startSite = item.geometry.coordinates
                          store.searchFeatures = []
                        }}
                      >
                        {item.properties.label}
                      </Text>
                    )
                  })}
                </Flex>
              )}
            </Flex>
            <Flex alignItems="flex-start" flexDirection="column" position="relative">
              <Text>End Place</Text>
              <Input
                onChange={store.onChangeEndPlace}
                value={store.endPlace}
                width="20vw"
                placeholder="Pleace Enter Ending place"
                mt="10px"
              />
              {store.endSite.length !== 0 && (
                <Text mt="10px">
                  Location: {store.endSite[0]}, {store.endSite[1]}
                </Text>
              )}
              {store.searchEndFeatures.length !== 0 && (
                <Flex
                  w="100%"
                  position="absolute"
                  flexDirection="column"
                  top="80px"
                  bg="white"
                  border="1px"
                  borderColor="#eee"
                  maxH="300px"
                  overflow="auto"
                  zIndex="22"
                >
                  {store.searchEndFeatures.map((item) => {
                    return (
                      <Text
                        fontSize="xs"
                        cursor="pointer"
                        p="10px"
                        css={{
                          "&:hover": {
                            background: "#eee",
                          },
                        }}
                        key={item.properties.id}
                        onClick={() => {
                          store.endPlace = item.properties.label
                          store.endSite = item.geometry.coordinates
                          store.searchEndFeatures = []
                        }}
                      >
                        {item.properties.label}
                      </Text>
                    )
                  })}
                </Flex>
              )}
            </Flex>
            <Button
              mt="34px"
              ml="10px"
              color="white"
              background="brandColor"
              disabled={store.startSite.length === 0 || store.endSite.length === 0}
              onClick={() => {
                store.getCoordinates()
              }}
            >
              Create Path
            </Button>
          </Flex>
          {/* <Box width="40%" height="100%">
            <iframe
              width="100%"
              height="100%"
              src="https://maps.openrouteservice.org/#/directions/Ladenburg,Germany/Heidelberg,Germany/data/55,130,32,198,15,97,4,224,38,9,96,59,2,24,5,192,166,6,113,0,184,64,14,0,232,3,96,1,128,86,82,6,103,32,26,0,88,4,228,62,227,24,184,129,184,142,63,1,24,1,51,208,14,192,217,189,65,85,243,225,11,68,4,0,14,169,224,68,77,135,40,5,208,32,3,55,128,6,221,46,112,1,60,195,234,64,28,192,45,52,116,150,2,187,238,77,22,72,45,232,119,163,184,140,17,188,58,200,152,24,193,110,200,250,24,208,40,202,0,110,232,0,250,218,14,33,184,160,168,46,150,232,168,241,144,14,136,168,184,2,114,152,0,22,46,9,129,96,168,48,184,164,36,114,0,238,232,240,150,37,217,149,213,174,56,124,44,0,190,114,0,94,80,0,182,184,124,248,189,189,64,0/embed/en-us"
            ></iframe>
          </Box> */}
        </Flex>
      </Flex>
      <Flex direction="row" align="center">
        <Flex
          direction="row"
          justify="center"
          align="center"
          flexWrap="wrap"
          justifyContent="space-between"
        >
          <Flex
            direction="column"
            mt="2rem"
            height="100px"
            border="1px solid gray"
            shadow="md"
            w={{ base: "100%", sm: "100%", lg: "48%", xl: "46vw" }}
            borderRadius="10px"
            h="160px"
          >
            <Flex p="10px" justify="space-between">
              <Text fontSize="20px">TimeStamp</Text>
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
            <Flex px="20px" pt="20px" justifyContent="space-between">
              <DateTimePicker
                formatStyle="small"
                value={store.startTime}
                label="StartTime"
                locale="en-US"
                onChange={store.onChangeStartTime}
                style={{ maxWidth: "45%", textAlign: "left" }}
              />
              <DateTimePicker
                formatStyle="small"
                value={store.endTime}
                label="EndTime"
                locale="en-US"
                onChange={store.onChangeEndTime}
                style={{ maxWidth: "45%", textAlign: "left" }}
              />
            </Flex>
          </Flex>
          {store.columnItems.map((item, index) => {
            return (
              <Box key={index} w={{ base: "100%", sm: "100%", lg: "48%", xl: "46vw" }}>
                <Flex align="center">
                  <Flex
                    direction="column"
                    mt="2rem"
                    height="120px"
                    border="1px solid gray"
                    w="100%"
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
          <Flex
            direction="column"
            mt="2rem"
            pb="10px"
            w={{ base: "100%", sm: "100%", lg: "48%", xl: "46vw" }}
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

          <Flex
            direction="column"
            mt="2rem"
            pb="10px"
            w={{ base: "100%", sm: "100%", lg: "48%", xl: "46vw" }}
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
