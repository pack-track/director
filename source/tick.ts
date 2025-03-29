import { TrainIndex } from "@packtrack/train";

export const tick = (trainIndex: TrainIndex) => {
	const spans = trainIndex.trains.map(train => train.span());

	for (let a of spans) {
		for (let b of spans) {
			if (a != b) {
				if (a.overlap(b)) {
					throw new Error('EMERGENCY SPAN OVERLAP!');
				}
			}
		}
	}

	setTimeout(() => tick(trainIndex));
};
