"use client";

import Image from "next/image";
import {
  RenderImageContext,
  RenderImageProps,
  RowsPhotoAlbum,
} from "react-photo-album";
import "react-photo-album/rows.css";
import type { Photo } from "react-photo-album";

import { useMemo, useRef, useState } from "react";
import { MedicalFile } from "@/lib/db/schema";
import { getFileUrl } from "@/lib/funcs";

import NextJsImage from "@/components/next-js-image";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { FullscreenRef } from "yet-another-react-lightbox";

function renderNextImage(
  { alt = "", title, sizes }: RenderImageProps,
  { photo, width, height }: RenderImageContext,
) {
  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        aspectRatio: `${width} / ${height}`,
      }}
    >
      <Image
        fill
        src={photo}
        alt={alt}
        title={title}
        sizes={sizes}
        placeholder={"blurDataURL" in photo ? "blur" : undefined}
        className="rounded-md"
      />
    </div>
  );
}

export default function Images({ files }: { files: MedicalFile[] }) {
  const [index, setIndex] = useState(-1);
  const fullscreenRef = useRef<FullscreenRef | null>(null);

  // Memoize the processed image list
  const images = useMemo(
    () =>
      files
        .filter((file) => file.type.startsWith("image"))
        .map((file) => ({
          src: getFileUrl(file.name) as string,
          width: 1920,
          height: 1080,
          alt: "test",
        })),
    [files]
  );

  return (
    <>
      <RowsPhotoAlbum
        photos={images}
        render={{ image: renderNextImage }}
        defaultContainerWidth={1200}
        sizes={{
          size: "1168px",
          sizes: [
            { viewport: "(max-width: 1200px)", size: "calc(100vw - 32px)" },
          ],
        }}
        onClick={({ index: current }) => setIndex(current)}
      />
      <Lightbox
        index={index}
        open={index >= 0}
        close={() => setIndex(-1)}
        slides={images}
        render={{ slide: NextJsImage }}
        plugins={[Thumbnails, Counter, Fullscreen, Video, Zoom]}
        counter={{ container: { style: { top: "unset", bottom: 0 } } }}
        fullscreen={{ ref: fullscreenRef }}
        on={{
          click: () => fullscreenRef.current?.enter(),
        }}
      />
    </>
  );
}