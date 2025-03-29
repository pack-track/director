import { Channel, Layout, PointPositioner, SectionPosition } from "@packtrack/layout";
import { MeasuredPosition, TrainIndex } from "@packtrack/train";

export class PointerController {
	constructor(
		private layout: Layout,
		private trainIndex: TrainIndex
	) {}

	// call when a pointer has been hit
	hit(channel: Channel) {
		const position = this.findPointerPosition(channel);
		const train = this.findPositionableTrain(position);

		// TODO find offset of positioner within train using type
		// TODO check for impossible jumps between readings
		train.lastPositioner = new MeasuredPosition(new Date(), position, train.reversed, 0);
	}

	out(channel: Channel) {
		// TODO update again, with offset
	}

	findPointerPosition(channel: Channel) {
		for (let district of this.layout.allDistricts) {
			for (let section of district.sections) {
				let inset = 0;

				for (let track of section.tracks) {
					for (let pointer of track.positioners) {
						if (pointer instanceof PointPositioner) {
							if (pointer.channel == channel) {
								return new SectionPosition(section, inset + pointer.offset, false);
							}
						}
					}

					inset += track.length;
				}
			}
		}

		throw new Error(`Pointer for channel '${channel}' not found`);
	}

	findPositionableTrain(position: SectionPosition) {
		for (let train of this.trainIndex.trains) {
			if (train.span().contains(position)) {
				return train;
			}
		}

		throw new Error(`Unexpected pointer hit at ${position}`);
	}
}
