'use client'

import { Tag, TagInput } from 'emblor';
import React, { useEffect } from 'react';

export default function Playground() {
    const [tags, setTags] = React.useState<Tag[]>([]);
    const [activeTagIndex, setActiveTagIndex] = React.useState<number | null>(null);
    
    // useEffect(() => {
    //     console.log(tags);
    // }, [tags]);
 
    return (
        <TagInput
            placeholder="Enter a topic"
            tags={tags} // Convert string[] back to Tag[]
            setTags={(newTags) => {
                setTags(newTags)
            }}
            activeTagIndex={activeTagIndex}
            setActiveTagIndex={setActiveTagIndex}
        />
    );
}
