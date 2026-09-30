// A port of the native SplitMix64 generator. It runs on BigInt so seeded
// layouts (freeform sites, drift phases) land exactly where they do on device.

const GOLDEN = -7046029254386353131n;
const MIX_A = -4658895280553007687n;
const MIX_B = -7723592293110705685n;
const UNIT_SCALE = 9007199254740992;

const wrap = (value: bigint) => BigInt.asIntN(64, value);
const unsignedShift = (value: bigint, bits: bigint) => wrap(BigInt.asUintN(64, value) >> bits);

export class SeededRandom {
	private state: bigint;

	constructor(seed: number) {
		this.state = wrap(BigInt(Math.trunc(seed * 1_000_003)) + GOLDEN);
	}

	next(): bigint {
		this.state = wrap(this.state + GOLDEN);
		let value = this.state;
		value = wrap((value ^ unsignedShift(value, 30n)) * MIX_A);
		value = wrap((value ^ unsignedShift(value, 27n)) * MIX_B);
		return value ^ unsignedShift(value, 31n);
	}

	unit(): number {
		return Number(BigInt.asUintN(64, this.next()) >> 11n) / UNIT_SCALE;
	}
}

/** Two large offsets into noise space, so different seeds sample different fields. */
export function seedOffset(seed: number, scale = 1): [number, number] {
	const random = new SeededRandom(seed);
	return [random.unit() * 97 * scale, random.unit() * 97 * scale];
}
