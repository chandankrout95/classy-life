
'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        instgrm?: {
            Embeds: {
                process: () => void;
            };
        };
    }
}

interface InstagramEmbedProps {
  embedCode: string;
}

export function InstagramEmbed({ embedCode }: InstagramEmbedProps) {
  useEffect(() => {
    // This is a global function that the Instagram embed script uses.
    // It might be undefined if the script hasn't loaded yet.
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, [embedCode]);

  return (
    <div
      className="instagram-post-container w-full h-full"
      dangerouslySetInnerHTML={{ __html: embedCode }}
    />
  );
}
