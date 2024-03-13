import { readFileSync, writeFileSync } from "fs";
import { Discovery } from "./discovery";
import { Layout } from "@packtrack/layout";
import { PointPositioner } from "@packtrack/layout/positioner/point";
import { createServer } from "net";

process.stdout.write(`PackTrack ${JSON.parse(readFileSync('package.json').toString()).version}\n`);

const layoutFileLocation = process.env.LAYOUT_FILE_LOCATION;
const layout = Layout.from(new DOMParser().parseFromString(readFileSync(layoutFileLocation).toString(), "text/xml"));

// set the active route to the only route for routes with only one route
// this only happens during testing of the layout while not all tracks are built yet
for (let district of layout.allDistricts) {
	for (let router of district.routers) {
		if (router.routes.length == 1) {
			router.activeRoute = router.routes[0];
		}
	}
}

// manually set all active routes
const setRoute = (routerName: string, routeName: string) => {
	for (let district of layout.allDistricts) {
		const router = district.routers.find(router => router.domainName == routerName);

		if (router) {
			router.activeRoute = router.routes.find(route => route.name == routeName);
		}
	}
}

setRoute('adu-join.southbound.fiddle-yard-east.kalkbreite.com', 'left');
setRoute('stem-south-branch-1.northbound.fiddle-yard-east.kalkbreite.com', 'left-left');
setRoute('stem-south-branch-2.northbound.fiddle-yard-east.kalkbreite.com', 'straight');
setRoute('stem-south-branch-3.northbound.fiddle-yard-east.kalkbreite.com', 'straight');
setRoute('stem-south-branch-4.northbound.fiddle-yard-east.kalkbreite.com', 'straight');
setRoute('stem-south-branch-5.northbound.fiddle-yard-east.kalkbreite.com', 'straight');

setRoute('north-split.southbound.fiddle-yard-east.kalkbreite.com', 'straight');
setRoute('stem-north-passover-storage-merge.northbound.fiddle-yard-east.kalkbreite.com', 'right');

// listen for devices on the network
Discovery.acceptConnections(layout.devices);

createServer({
	noDelay: true
}, socket => {
	socket.setTimeout(2500);
	socket.setKeepAlive(true, 2500);

	const address = socket.remoteAddress.split(':').pop();
	const device = layout.devices.find(device => device.lastDiscovery?.address == address);

	const positioners: PointPositioner[] = [];

	for (let district of layout.allDistricts) {
		for (let section of district.sections) {
			for (let track of section.tracks) {
				for (let positioner of track.positioners) {
					if (positioner instanceof PointPositioner) {
						if (positioner.channel.device == device) {
							positioners.push(positioner);
						}
					}
				}
			}
		}
	}

	// device.handleConnection(socket, positioners, train);
}).listen(141);

const train = new Train();
train.reversed = false;
train.maximalAcceleration = 5;
train.speed = 42.6; // speed step 215 / ae 6/6
train.length = 23;

let length = 0;

setInterval(() => {
	const head = train.head;

	if (head) {
		const elapsed = (+new Date() - +train.lastPositioner.time) / 1000;

		console.log(head.toString(), `${elapsed}s`, `${length / elapsed}m/s`);

		writeFileSync('layout.svg', layout.toSVG(train.toSVG()));
	} else {
		console.log('< no position known >');
	}
}, 1000);

function tick() {
	const head = train.head;

	if (!length && head) {
		let tip = head.nominal.section;

		while (tip) {
			length += tip.length;

			tip = tip.next(false);

			if (tip == head.nominal.section) {
				break;
			}
		}
	}

	setTimeout(() => tick());
}

tick();