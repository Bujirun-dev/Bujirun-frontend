import { toPng } from "html-to-image";

export const waitForImages = async (element: HTMLElement) => {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve();

      return new Promise<void>((resolve) => {
        image.onload = () => resolve();
        image.onerror = () => resolve();
      });
    }),
  );
};

const sanitizeFileName = (fileName: string) => fileName.replace(/[\\/:*?"<>|]/g, "").trim();

export const createReceiptFileName = (title: string, tripId: number) => {
  const safeTitle = sanitizeFileName(title);

  return safeTitle ? `[bujirun]${safeTitle}.png` : `[bujirun]receipt-${tripId}.png`;
};

export const downloadReceiptAsPng = async (element: HTMLElement, fileName: string) => {
  await document.fonts.ready;
  await waitForImages(element);

  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "transparent",
  });

  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  link.click();
};
