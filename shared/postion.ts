import { Section } from "@packtrack/layout/section";


export class SectionPosition {
    constructor(
        public section: Section,
        public offset: number,
        public reversed: boolean
    ) {}

    get absolutePosition() {
        if (this.reversed) {
            return this.section.length - this.offset;
        }

        return this.offset;
    }

    advance(distance: number) {
        if (this.offset + distance > this.section.length) {
            const next = this.section.next(this.reversed);

            if (!next) {
                throw new Error(`Illegal advancement ${this} + ${distance}`);
            }

            return new SectionPosition(next, 0, this.reversed).advance(this.offset + distance - this.section.length);
        }
        
        return new SectionPosition(this.section, this.offset + distance, this.reversed);
    }

    toString() {
        return `${this.section.name} @ ${this.offset.toFixed(1)} ${this.reversed ? 'backward' : 'forward'}`;
    }
}