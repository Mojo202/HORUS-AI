/**
 * Converts an image data URL (e.g., JPEG, PNG) to a WebP data URL using a canvas.
 * @param imageDataUrl The base64 data URL of the source image.
 * @param quality A number between 0 and 1 indicating the image quality.
 * @returns A promise that resolves with the base64 data URL of the WebP image.
 */
export function convertToWebp(imageDataUrl: string, quality: number = 0.9): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Allow loading external images

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Could not get 2D context from canvas.'));
      }

      ctx.drawImage(img, 0, 0);
      
      // Convert the canvas content to a WebP data URL.
      // The second parameter is the quality, ranging from 0 to 1.
      const webpDataUrl = canvas.toDataURL('image/webp', quality);
      resolve(webpDataUrl);
    };

    img.onerror = (error) => {
      console.error("Error loading image for conversion:", error);
      reject(new Error('Failed to load the image for conversion.'));
    };

    let urlToLoad = imageDataUrl;
    // Use a CORS proxy for external pollinations URLs
    if (imageDataUrl.startsWith('https://image.pollinations.ai')) {
      urlToLoad = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageDataUrl)}`;
    }
    img.src = urlToLoad;
  });
}

/**
 * Resizes and crops an image to exact dimensions using a canvas, maintaining aspect ratio.
 * This function performs a "center-crop" to fit the image within the target dimensions.
 * @param imageDataUrl The base64 data URL of the source image.
 * @param targetWidth The desired final width in pixels.
 * @param targetHeight The desired final height in pixels.
 * @returns A promise that resolves with the new base64 data URL of the cropped and resized image.
 */
export function resizeAndCropImage(imageDataUrl: string, targetWidth: number, targetHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Could not get 2D context from canvas.'));
      }

      const sourceWidth = img.width;
      const sourceHeight = img.height;
      const targetAspectRatio = targetWidth / targetHeight;
      const sourceAspectRatio = sourceWidth / sourceHeight;

      let sx, sy, sWidth, sHeight;

      if (sourceAspectRatio > targetAspectRatio) {
        // Source image is wider than target
        sHeight = sourceHeight;
        sWidth = sHeight * targetAspectRatio;
        sx = (sourceWidth - sWidth) / 2;
        sy = 0;
      } else {
        // Source image is taller than target
        sWidth = sourceWidth;
        sHeight = sWidth / targetAspectRatio;
        sx = 0;
        sy = (sourceHeight - sHeight) / 2;
      }
      
      // Draw the calculated portion of the source image onto the full canvas
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
      
      const resultDataUrl = canvas.toDataURL('image/webp', 0.95); // High quality for resized images
      resolve(resultDataUrl);
    };

    img.onerror = (error) => {
      console.error("Error loading image for resizing:", error);
      reject(new Error('Failed to load the image for resizing.'));
    };

    img.src = imageDataUrl;
  });
}

/**
 * Intelligently removes a watermark from an image by painting over it with pixels from above.
 * This method is less destructive than blurring and works better on varied backgrounds.
 * It also includes a CORS proxy fallback for external images.
 * @param imageUrl The data URL or external URL of the source image.
 * @returns A promise that resolves with the new base64 data URL of the cleaned image.
 */
export function paintOverWatermark(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Could not get 2D context.'));

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Define watermark area more precisely (bottom right)
      const watermarkHeight = 35; 
      const watermarkWidth = 200; 

      if (canvas.width < watermarkWidth || canvas.height < watermarkHeight) {
          console.warn("Image is smaller than watermark area, skipping removal.");
          resolve(canvas.toDataURL('image/png'));
          return;
      }

      const startX = canvas.width - watermarkWidth;
      const startY = canvas.height - watermarkHeight;
      
      // Get a clean patch of pixels from directly above the watermark
      const patchData = ctx.getImageData(startX, startY - 5, watermarkWidth, 5);

      // "Paint" over the watermark area by repeatedly drawing the clean patch
      for (let y = 0; y < watermarkHeight; y += 5) {
          ctx.putImageData(patchData, startX, startY + y);
      }

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
        // Fallback to CORS proxy if direct loading fails
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
        if (img.src !== proxyUrl) {
            console.warn('Direct image load failed, trying with CORS proxy.');
            img.src = proxyUrl;
        } else {
            reject(new Error("Failed to load image for watermark removal, even with proxy."));
        }
    };
    
    // First, try to load the image directly
    img.src = imageUrl;
  });
}