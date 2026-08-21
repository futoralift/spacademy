import React from 'react';

interface Block {
  type: string;
  data: any;
}

interface BlockRendererProps {
  content: string | any;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ content }) => {
  let blocks: Block[] = [];
  
  try {
    if (typeof content === 'string') {
      const parsed = JSON.parse(content);
      blocks = parsed.blocks || [];
    } else if (content && content.blocks) {
      blocks = content.blocks;
    }
  } catch (e) {
    // If it's not JSON, treat it as raw text/HTML
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return (
    <div className="space-y-8">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'header':
            const HeaderTag = `h${block.data.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
            return (
              <HeaderTag key={index} className="font-bold tracking-tight text-foreground">
                {block.data.text}
              </HeaderTag>
            );
          
          case 'paragraph':
            return (
              <p key={index} className="text-muted-foreground leading-relaxed italic" dangerouslySetInnerHTML={{ __html: block.data.text }} />
            );
            
          case 'list':
            const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            return (
              <ListTag key={index} className="list-inside space-y-3">
                {block.data.items.map((item: any, i: number) => (
                  <li key={i} className="text-muted-foreground italic pl-2 border-l-2 border-primary/20">
                    {typeof item === 'string' ? item : item.content}
                  </li>
                ))}
              </ListTag>
            );
            
          case 'quote':
            return (
              <blockquote key={index} className="border-l-4 border-primary bg-muted/30 p-8 rounded-3xl italic">
                <p className="text-2xl mb-4 text-foreground">"{block.data.text}"</p>
                {block.data.caption && (
                  <cite className="text-sm font-bold text-muted-foreground sticky not-italic">— {block.data.caption}</cite>
                )}
              </blockquote>
            );
            
          case 'delimiter':
            return (
              <div key={index} className="flex justify-center py-8">
                <div className="flex gap-2">
                  <div className="size-2 rounded-full bg-primary/20" />
                  <div className="size-2 rounded-full bg-primary/40" />
                  <div className="size-2 rounded-full bg-primary/20" />
                </div>
              </div>
            );
            
          case 'table':
            return (
              <div key={index} className="overflow-x-auto my-8 border border-border/40 rounded-3xl">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {block.data.content.map((row: string[], i: number) => (
                      <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-muted/5 transition-colors">
                        {row.map((cell, j) => (
                          <td key={j} className="p-4 text-muted-foreground italic border-r border-border/40 last:border-0">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
            
          case 'image':
            return (
              <figure key={index} className="my-12">
                <img 
                  src={block.data.file?.url || block.data.url} 
                  alt={block.data.caption || ""} 
                  className="rounded-[2.5rem] shadow-2xl w-full object-cover"
                />
                {block.data.caption && (
                  <figcaption className="text-center mt-4 text-sm text-muted-foreground italic">
                    {block.data.caption}
                  </figcaption>
                )}
              </figure>
            );

          default:
            console.warn(`Unknown block type: ${block.type}`);
            return null;
        }
      })}
    </div>
  );
};

export default BlockRenderer;
