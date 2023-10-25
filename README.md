# Pebble Data Generator

This is a [Pebble Tracker](https://docs.iotex.io/secure-hardware/pebble-tracker) verifiable data generator: it generates a set of data for an hypotatycal Pebble Device, accounrding to the user rules, then it signs the data as a area device would do and transmits the data to the IoTeX network for use in Dapps.

This tool is available at [https://brewmy.info](https://brewmy.info])

This is app is created using [Blitz.js](https://github.com/blitz-js/blitz).

## For users

### Prerequisites
Please contact an admin on our Discord channel and request a pre-registered Pebble Tracker identity (IMEI & Private key)

### Use the data generator
1. Access the web tool at brewmy.info
![image](https://user-images.githubusercontent.com/11096047/131354629-a4eb5a46-2605-4f60-86c2-43b705892f62.png)

2. Set the GPS route
You can either select one of the pre-defined routes from the combo box, or set your own start and end points for your route. If you set your custom route, click "Create path" to generate the GPS locations

3. Set the timestamp range
Set the start and end time for your dataset, make sure the end time is after the start time! The timestamps will be generated to be equally distributed along all data points.

4. Set the generator for each sensor
For each sensor data, set and configure the generator. At this moment, only a constant value or a random value generator are available (feel free to [hack the web tool to add more generators](#for_developers)!). 

**Constant generator**: you can pick the value for that sensor, and it will be replicated along the entire dataset

**Random generator**: you can pick the minimum and maximum value for that sensor, and a random value included in [min, max] will be generated forit along the entire dataset

5. Export the dataset
If you intend to "hack" your dataset (e.g. introduce over/under-temperature, mechanical shocks, ambient light over the threshold, etc...) you can:
- Export the dataset by selecting CSV in the "Type" dropdown
- Edit your CSV by introducing your custom "events"
- Reimport the CSV by clicking the "Import" button

6. Send the data to the network
Once your dataset is ready, you can use the web tool to transmit the data to the network by clicking the "Submit to TruStream" button:
![image](https://user-images.githubusercontent.com/11096047/131355306-50b7fd5d-5d0f-4abd-9e09-a6b060d92877.png)


The tool will ask for the IMEI and private key of your "simulated device" (please ask in our discord channel if you need a device identity), input the data and confirm.
At the end of the transmission, your dataset will be "ingested" and verified by the network and, eventually, indexed in the TruTream Graph node ready to be pulled by your Dapp (see the Fetch Device Telemetry section).

## For Developers

Run this tool locally in the development mode:

```
blitz dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Check out the [Blitz! framework](https://github.com/blitz-js/blitz#readme) for more.


