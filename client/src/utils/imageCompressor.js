/**
 * Client-Side Image Compressor & Resizer Utility.
 *
 * Automatically resizes & compresses large image files down to under target KB (default 500KB)
 * and optimal square dimensions (default max 800x800px) using HTML5 Canvas.
 *
 * @param {File} file - Original file input from user
 * @param {number} maxSizeKB - Target maximum size in KB (default 500)
 * @param {number} maxDimension - Maximum width/height in px (default 800)
 * @returns {Promise<File>} Compressed File object ready for upload
 */
export const compressImage = (file, maxSizeKB = 500, maxDimension = 800) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Resize proportionally to maxDimension (800px)
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Quality compression loop
        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        const dataURItoBlob = (dataURI) => {
          const byteString = atob(dataURI.split(',')[1]);
          const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          return new Blob([ab], { type: mimeString });
        };

        let blob = dataURItoBlob(dataUrl);

        // Iteratively reduce quality if size still exceeds target KB
        while (blob.size > maxSizeKB * 1024 && quality > 0.2) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          blob = dataURItoBlob(dataUrl);
        }

        const fileName = file.name.replace(/\.[^/.]+$/, '') + '_compressed.jpg';
        const compressedFile = new File([blob], fileName, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        resolve(compressedFile);
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
};
