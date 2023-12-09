import "./index.css";
import src from "./home.png";
import { meta, frames } from "./home.json";

class Array2D<Type = any> {
	items: Type[][];

	constructor(width: number, height: number) {
		this.items = new Array(width)
			.fill(undefined)
			.map(() => new Array(height).fill(undefined));
	}

	iterate(cb: (cell: Type, i: number, j: number) => void) {
		this.items.forEach((row, i) => {
			row.forEach((cell, j) => {
				cb(cell, i, j);
			});
		});
	}
}

function getFramePosition(layer: string, frame: number) {
	const key = `${layer}.${frame}.aseprite`;
	if (!(key in frames)) throw new Error(`${key} is not a valid frame key.`);
	return frames[key]!.frame;
}

document.addEventListener("readystatechange", async () => {
	if (document.readyState !== "complete") return;

	const image = await new Promise<HTMLImageElement>((resolve, reject) => {
		const image = document.createElement("img");
		image.src = src;
		image.width = meta.size.w;
		image.height = meta.size.h;
		const timeout = setTimeout(reject.bind(null, `Could not load ${src}`), 100);
		image.onload = () => {
			clearTimeout(timeout);
			resolve(image);
		};
	});

	function createCanvas(i: number, j: number, disabled: boolean) {
		const container = document.createElement("div");
		if (disabled) container.ariaDisabled = "disabled";
		container.id = `x${i}y${j}`;

		const canvas = document.createElement("canvas");
		canvas.height = canvas.width = 32;
		canvas.style.height = canvas.style.width = `${canvas.width * 4}px`;
		const context = canvas.getContext("2d");
		if (!context) throw new Error("could not initialize Context2D.");

		let frameIndex = 0;
		canvas.addEventListener("click", () => {
			frameIndex++;
			context.clearRect(0, 0, 32, 32);
			for (const layer of meta.layers) {
				let position: ReturnType<typeof getFramePosition>;
				try {
					position = getFramePosition(layer.name, frameIndex);
				} catch (_) {
					frameIndex = 0;
					position = getFramePosition(layer.name, frameIndex);
				}
				const { x, y, w, h } = position;
				context.drawImage(image, x, y, w, h, 0, 0, 32, 32);
			}
		});

		Object.entries({
			"&uarr;": [0, -1],
			"&rarr;": [1, 0],
			"&darr;": [0, 1],
			"&larr;": [-1, 0],
		}).forEach(([key, [x, y]]) => {
			const button = document.createElement("button");
			button.innerHTML = key;
			button.style.left = `${(x + 1) * 50}%`;
			button.style.top = `${(y + 1) * 50}%`;
			button.onclick = () => {
				const id = `#x${i + x}y${j + y}`;
				const neighbor = document.querySelector<HTMLDivElement>(id);
				if (neighbor)
					neighbor.ariaDisabled = neighbor.ariaDisabled ? null : "disabled";
			};
			container.appendChild(button);
		});

		container.appendChild(canvas);
		return container;
	}

	const main = document.createElement("main");

	new Array2D(3, 3).iterate((_, i, j) => {
		main.appendChild(createCanvas(j, i));
	});

	document.body.appendChild(main);
});
