import { getSliceIndex } from "./getSliceIndex.js";
import { insertSlice } from "./insertSlice.js";
import { throttle } from "../throttle.js";

export function loadImageDataProgressively(imageIds, imageData, metaDataMap, zAxis, renderCallback) {
    const loadImagePromises = imageIds.map(imageId => cornerstone.loadAndCacheImage(imageId));
    const throttledImageModified = throttle(() => {
        renderCallback();
    }, 300);

    const insertSlicePromises = loadImagePromises.map(promise => {
        return new Promise((resolve, reject) => {
          promise.then((image) => {
            const imageMetaData = metaDataMap.get(image.imageId);
            const sliceIndex = getSliceIndex(zAxis, imageMetaData.imagePositionPatient);
            const pixels = image.getPixelData();

            insertSlice(imageData, pixels, sliceIndex);

            //throttledImageModified();

            //renderCallback();

            resolve();
          }, reject)
        });
    });

    Promise.all(insertSlicePromises).then(() => {
        renderCallback();
    });
}
