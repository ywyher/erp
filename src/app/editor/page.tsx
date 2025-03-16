'use client'

import { useProcessStore } from '@/components/editor/store';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';
import { Plate } from '@udecode/plate/react';
import { Tag, TagInput } from 'emblor';
import React, { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner';

const value = [
    {
        "id": "MPACiWPoFv",
        "url": "https://pub-d074aa57b59b465ebc13b907eca3345b.r2.dev/b32af8db260f819554ff41fe839a01e54fc33860719288d2e9cd7ca1458de2ba",
        "name": "b32af8db260f819554ff41fe839a01e54fc33860719288d2e9cd7ca1458de2ba",
        "type": "img",
        "children": [
          {
            "text": ""
          }
        ],
        "isUpload": true,
        "placeholderId": "eFaiJriDr0I6zY6Laob7z"
      },
]

export default function Playground() {
    const editor = useCreateEditor({});

    const { isProcessing, operation } = useProcessStore();
    
    useEffect(() => {
        console.log(`########################`)
        console.log(isProcessing)
        console.log(operation)
        console.log(`########################`)
        // toast.loading('Uploading', {
        //     duration: 1
        // })
    }, [isProcessing])
    
    return (
        <DndProvider backend={HTML5Backend}>
            <Plate
                editor={editor}
            >
            <EditorContainer className="border rounded-md">
                <Editor
                    variant={'fullWidth'}
                    placeholder="Type..." 
                />
            </EditorContainer>
            </Plate>
        </DndProvider>
    );
}
