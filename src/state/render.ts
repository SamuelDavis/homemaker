import textureSrc from "../assets/texture.png";
import textureData from "../assets/texture.json";
import { createEffect, createRoot } from "solid-js";
import {
    createRecordWithKeys,
    createSignal, loadSpriteSheetContext,
    overwriteImageData,
    sliceImageData,
    wrapN
} from "../util";
import { assertDefined, logDefined } from "../types";
import {
    frameCountByName,
    frameHeight,
    frameWidth,
    getFrame,
    getLightingFrame,
    layerNames
} from "../data";
import { color } from "./color";

export const render = createRoot(() => {
    const [getSpriteSheetContext, setSpriteSheetContext] = createSignal<
        OffscreenCanvasRenderingContext2D | undefined
    >(undefined);
    const lightingCanvas = new OffscreenCanvas(frameWidth, frameHeight);
    const lightingContext = assertDefined(
        "lighting context",
        lightingCanvas.getContext("2d")
    );

    const contexts = createRecordWithKeys((name) => {
        const canvas = document.createElement("canvas");
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        canvas.style.setProperty("--width", canvas.width.toString());
        canvas.style.setProperty("--height", canvas.height.toString());
        const context = canvas.getContext("2d");
        if (!context)
            throw new Error(`Could not initialize context for ${name} canvas.`);
        return context;
    }, layerNames);
    const frames = createRecordWithKeys(
        (name) => createSignal(0, {
            equals: false,
            setter: (value) => wrapN(frameCountByName[name], value),
            persistenceKey: `${name}-frame`,
        }),
        layerNames
    );

    const textureEnabled = createSignal(false);
    const [getTextureEnabled] = textureEnabled;
    const [getRenderTexture, setRenderTexture] = createSignal<
        OffscreenCanvasRenderingContext2D | undefined
    >(undefined);
    const textureCanvas = new OffscreenCanvas(frameWidth, frameHeight);
    const textureContext = assertDefined(
        "texture context",
        textureCanvas.getContext("2d")
    );
    const textureImage = new Image(
        textureData.meta.size.w,
        textureData.meta.size.h
    );
    textureImage.src = textureSrc;
    textureImage.onload = () => {
        const pattern = assertDefined(
            "texture pattern",
            textureContext.createPattern(textureImage, "repeat")
        );
        textureContext.fillStyle = pattern;
        textureContext.globalAlpha = 0.5;
        textureContext.fillRect(
            0,
            0,
            textureContext.canvas.width,
            textureContext.canvas.height
        );
        setRenderTexture(textureContext);
    };

    function callback() {
        const spriteSheetContext = logDefined(
            "sprite sheet context",
            getSpriteSheetContext()
        );
        if (!spriteSheetContext) return;
        const colorReplacements = color.getReplacements();

        const { width, height } = spriteSheetContext.canvas;
        const spriteSheetImageData = spriteSheetContext.getImageData(
            0,
            0,
            width,
            height
        );
        overwriteImageData(spriteSheetImageData.data, colorReplacements);

        const textureEnabled = getTextureEnabled();
        for (const name of layerNames) {
            const index = assertDefined(`${name} frame`, frames[name]?.[0]());
            const imageFrame = assertDefined(
                `frame ${index} of ${name}`,
                getFrame(name, index)
            );
            const lightingFrame = getLightingFrame(name, index);
            const renderTexture = getRenderTexture();
            const renderContext = assertDefined(`${name} context`, contexts[name]);
            const imageSlice = sliceImageData(
                spriteSheetImageData,
                imageFrame.x,
                imageFrame.y,
                imageFrame.w,
                imageFrame.h
            );

            const lightingSlice = lightingFrame
                ? sliceImageData(
                    spriteSheetImageData,
                    lightingFrame.x,
                    lightingFrame.y,
                    lightingFrame.w,
                    lightingFrame.h
                )
                : undefined;

            requestAnimationFrame(function() {
                const { width, height } = renderContext.canvas;
                renderContext.clearRect(0, 0, width, height);
                renderContext.putImageData(imageSlice, 0, 0);
                renderContext.globalAlpha = 0.5;
                if (textureEnabled && renderTexture) {
                    renderContext.save();
                    renderContext.globalCompositeOperation = "source-atop";
                    renderContext.drawImage(textureContext.canvas, 0, 0);
                    renderContext.restore();
                }
                if (lightingSlice) {
                    lightingContext.clearRect(
                        0,
                        0,
                        lightingContext.canvas.width,
                        lightingContext.canvas.height
                    );
                    lightingContext.putImageData(lightingSlice, 0, 0);
                    renderContext.drawImage(lightingContext.canvas, 0, 0);
                }
            });
        }
    }

    loadSpriteSheetContext().then(setSpriteSheetContext);
    createEffect(callback);

    return {
        callback,
        contexts,
        frames,
        textureEnabled,
    } as const;
});

