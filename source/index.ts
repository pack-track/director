import { Layout } from "@packtrack/layout";
import { readFileSync } from "fs";
import { DOMParser } from "xmldom";

process.stdout.write(`PackTrack ${JSON.parse(readFileSync('package.json').toString()).version}\n`);

const layoutFileLocation = process.env.LAYOUT_FILE_LOCATION;
const layout = Layout.from(new DOMParser().parseFromString(readFileSync(layoutFileLocation).toString(), "text/xml"));



/*
import { readFileSync } from "fs";
import { Discovery } from "./discovery/index.js";
import { DirectorServer } from "./server.js";
import { PointerController } from "./positioner/pointer.js";
import { PointerHitMessage, PointerOutMessage } from "@packtrack/protocol";
import { TrainIndex } from "@packtrack/train";
import { tick } from "./tick.js";


const trainIndexFileLocation = process.env.TRAIN_INDEX_FILE_LOCATION;
const trainIndex = TrainIndex.from(new DOMParser().parseFromString(readFileSync(trainIndexFileLocation).toString(), "text/xml"), layout);

// set the active route to the only route for routes with only one route
// this only happens during testing of the layout while not all tracks are built yet
for (let district of layout.allDistricts) {
	for (let router of district.routers) {
		if (router.routes.length == 1) {
			router.activeRoute = router.routes[0];
		}
	}
}

// listen for devices on the network
Discovery.acceptConnections(layout.devices);

const server = new DirectorServer(layout);

const pointerController = new PointerController(layout, trainIndex);
server.route(PointerHitMessage, (device, message) => pointerController.hit(device.channels.find(channel => channel.name == message.headers.channel)));
server.route(PointerOutMessage, (device, message) => pointerController.out(device.channels.find(channel => channel.name == message.headers.channel)));

// start server and tick
server.start().then(() => tick(trainIndex));
*/
