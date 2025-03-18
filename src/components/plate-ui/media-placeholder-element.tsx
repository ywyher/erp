'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import type { TPlaceholderElement } from '@udecode/plate-media';

import { cn } from '@udecode/cn';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  PlaceholderPlugin,
  PlaceholderProvider,
  updateUploadHistory,
  VideoPlugin,
} from '@udecode/plate-media/react';
import {
  PlateElement,
  useEditorPlugin,
  withHOC,
  withRef,
} from '@udecode/plate/react';
import { AudioLines, FileUp, Film, ImageIcon } from 'lucide-react';
import { useFilePicker } from 'use-file-picker';

import { Spinner } from './spinner';
import { formatBytes } from '@/lib/utils';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useProcessStore } from '@/components/editor/store';

const CONTENT: Record<
  string,
  {
    accept: string[];
    content: ReactNode;
    icon: ReactNode;
  }
> = {
  [AudioPlugin.key]: {
    accept: ['audio/*'],
    content: 'Add an audio file',
    icon: <AudioLines />,
  },
  [FilePlugin.key]: {
    accept: ['*'],
    content: 'Add a file',
    icon: <FileUp />,
  },
  [ImagePlugin.key]: {
    accept: ['image/*'],
    content: 'Add an image',
    icon: <ImageIcon />,
  },
  [VideoPlugin.key]: {
    accept: ['video/*'],
    content: 'Add a video',
    icon: <Film />,
  },
};

export const MediaPlaceholderElement = withHOC(
  PlaceholderProvider,
  withRef<typeof PlateElement>(
    ({ children, className, nodeProps, ...props }, ref) => {
      const editor = props.editor;
      const element = props.element as TPlaceholderElement;

      const { api } = useEditorPlugin(PlaceholderPlugin);

      const { handleUpload, isUploading, progresses } = useFileUpload();
      const [uploadedFile, setUploadedFile] = useState<any>(null);
      const [uploadingFile, setUploadingFile] = useState<File | null>(null);

      const loading = isUploading && uploadingFile;

      // Inside MediaPlaceholderElement
      const { 
        setIsProcessing, 
        setOperation, 
      } = useProcessStore();

      // When starting an upload
      useEffect(() => {
        setIsProcessing(isUploading);
        setOperation(isUploading ? 'upload' : undefined);
      }, [isUploading, progresses, uploadingFile, setIsProcessing, setOperation]);


      const currentContent = CONTENT[element.mediaType];

      const isImage = element.mediaType === ImagePlugin.key;

      const imageRef = useRef<HTMLImageElement>(null);

      const { openFilePicker } = useFilePicker({
        accept: currentContent.accept,
        multiple: true,
        onFilesSelected: ({ plainFiles: updatedFiles }) => {
          const firstFile = updatedFiles[0];
          const restFiles = updatedFiles.slice(1);

          replaceCurrentPlaceholder(firstFile);

          restFiles.length > 0 && (editor as any).tf.insert.media(restFiles);
        },
      });

      const replaceCurrentPlaceholder = useCallback(
        async (file: File) => {
          console.log('testing')
          setUploadingFile(file);
          api.placeholder.addUploadingFile(element.id as string, file);
          
          const result = await handleUpload(file);
          if (!result.error) {
            setUploadedFile(result);
          } else {
            // Clean up the UI state
            api.placeholder.removeUploadingFile(element.id as string);
            setUploadingFile(null);
          }
        },
        [api.placeholder, element.id, handleUpload]
      );

      useEffect(() => {
        if (!uploadedFile) return;

        const path = editor.api.findPath(element);

        editor.tf.withoutSaving(() => {
          editor.tf.removeNodes({ at: path });

          const node = {
            children: [{ text: '' }],
            initialHeight: imageRef.current?.height,
            initialWidth: imageRef.current?.width,
            isUpload: true,
            // name: element.mediaType === FilePlugin.key ? uploadedFile.name : '',
            name: uploadedFile.name,
            placeholderId: element.id as string,
            type: element.mediaType!,
            url: uploadedFile.url,
          };

          editor.tf.insertNodes(node, { at: path });

          updateUploadHistory(editor, node);
        });

        api.placeholder.removeUploadingFile(element.id as string);
        setUploadingFile(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [uploadedFile, element.id]);

      // React dev mode will call useEffect twice
      const isReplaced = useRef(false);

      /** Paste and drop */
      useEffect(() => {
        if (isReplaced.current) return;

        isReplaced.current = true;
        const currentFiles = api.placeholder.getUploadingFile(
          element.id as string
        );

        if (!currentFiles) return;

        replaceCurrentPlaceholder(currentFiles);

        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [isReplaced]);

      // Get progress for the current file
      const progress = uploadingFile ? progresses[uploadingFile.name] || 0 : 0;

      return (
        <PlateElement ref={ref} className={cn(className, 'my-1')} {...props}>
          {(!loading || !isImage) && (
            <div
              className={cn(
                'flex cursor-pointer items-center rounded-sm bg-muted p-3 pr-9 select-none hover:bg-primary/10'
              )}
              onClick={() => !loading && openFilePicker()}
              contentEditable={false}
            >
              <div className="relative mr-3 flex text-muted-foreground/80 [&_svg]:size-6">
                {currentContent.icon}
              </div>
              <div className="text-sm whitespace-nowrap text-muted-foreground">
                <div>
                  {loading ? uploadingFile?.name : currentContent.content}
                </div>

                {loading && !isImage && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <div>{formatBytes(uploadingFile?.size ?? 0)}</div>
                    <div>–</div>
                    <div className="flex items-center">
                      <Spinner className="mr-1 size-3.5" />
                      {Math.round(progress)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isImage && loading && (
            <ImageProgress
              file={uploadingFile!}
              imageRef={imageRef}
              progress={progress}
            />
          )}

          {children}
        </PlateElement>
      );
    }
  )
);

export function ImageProgress({
  className,
  file,
  imageRef,
  progress = 0,
}: {
  file: File;
  className?: string;
  imageRef?: React.RefObject<HTMLImageElement | null>;
  progress?: number;
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!objectUrl) {
    return null;
  }

  return (
    <div className={cn('relative', className)} contentEditable={false}>
      <img
        ref={imageRef}
        className="h-auto w-full rounded-sm object-cover"
        alt={file.name}
        src={objectUrl}
      />
      {progress < 100 && (
        <div className="absolute right-1 bottom-1 flex items-center space-x-2 rounded-full bg-black/50 px-1 py-0.5">
          <Spinner />
          <span className="text-xs font-medium text-white">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}