import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface TreeNodeProps {
  label: string;
  subtitle?: string;
  children?: TreeNodeProps[];
  collapsible?: boolean;
  level?: number;
  childrenFormation?: 'grid' | 'row';

  sideChild?: {
    node: TreeNodeProps;
    direction: 'left' | 'right';
    connectorLength?: number;  
  };
}

const CONNECTOR_CONFIG = {
  lineWidth: 'w-0.5',
  lineColor: 'bg-slate-400',
  verticalGap: 32, 
  horizontalSpacing: {
    grid: 250,
    row: 400
  },
  minWidth: {
    grid: 250,
    row: 180
  }
};

interface ConnectorProps {
  type: 'vertical-down' | 'vertical-up' | 'horizontal';
  width?: number;
  height?: number;
  className?: string;
}

function Connector({ type, width, height, className = '' }: ConnectorProps) {
  const baseClasses = `absolute ${CONNECTOR_CONFIG.lineColor}`;
  
  switch (type) {
    case 'vertical-down':
      return (
        <div 
          className={`${baseClasses} ${CONNECTOR_CONFIG.lineWidth} left-1/2 -translate-x-1/2 ${className}`}
          style={{ height: height || CONNECTOR_CONFIG.verticalGap }}
        />
      );
    
    case 'vertical-up':
      return (
        <div 
          className={`${baseClasses} ${CONNECTOR_CONFIG.lineWidth} left-1/2 -translate-x-1/2 ${className}`}
          style={{ height: height || CONNECTOR_CONFIG.verticalGap }}
        />
      );
    
    case 'horizontal':
      return (
        <div 
          className={`${baseClasses} h-0.5 left-1/2 -translate-x-1/2 ${className}`}
          style={{ width: width || 200 }}
        />
      );
    
    default:
      return null;
  }
}

function useConnectorDimensions(
  childCount: number, 
  formation: 'grid' | 'row'
) {
  return React.useMemo(() => {
    if (childCount <= 1) return { shouldRenderHorizontal: false, width: 0 };
    
    const spacing = CONNECTOR_CONFIG.horizontalSpacing[formation];
    const minWidth = CONNECTOR_CONFIG.minWidth[formation];
    const calculatedWidth = Math.max(minWidth, (childCount - 1) * spacing);
    
    return {
      shouldRenderHorizontal: true,
      width: calculatedWidth
    };
  }, [childCount, formation]);
}

function ConnectorContainer({ 
  children, 
}: { 
  children: React.ReactNode;
  hasParent?: boolean;
}) {
  return (
    <div className="relative w-full">
      {children}
    </div>
  );
}

export function OrgTree({
  data,
  collapsible = false,
}: {
  data: TreeNodeProps;
  collapsible?: boolean;
}) {
  const formation = data.childrenFormation ?? 'grid';
  const connectorDims = useConnectorDimensions(data.children?.length || 0, formation);

  return (
    <div className="flex flex-col items-center p-8">
      <TreeNode 
        label={data.label} 
        subtitle={data.subtitle} 
        level={0} 
        sideChild={data.sideChild}
        collapsible={false} 
      />
      {data.children && data.children.length > 0 && (
        <ConnectorContainer hasParent={false}>
          <Connector type="vertical-down" className="top-0" />
          {connectorDims.shouldRenderHorizontal && (
            <Connector 
              type="horizontal" 
              width={connectorDims.width}
              className="top-8" 
            />
          )}
          <div className={`mt-8 ${
            formation === 'grid' 
              ? `grid grid-cols-${Math.min(data.children.length, 4)} gap-8 justify-items-center`
              : 'flex space-x-12 justify-center'
          }`}>
            {data.children.map((child, idx) => (
              <TreeNode
                key={idx}
                {...child}
                level={1}
                collapsible={collapsible}
            />
            ))}
          </div>
        </ConnectorContainer>
      )}
    </div>
  );
}

export function TreeNode({
  label,
  subtitle,
  children,
  collapsible = false,
  level = 0,
  childrenFormation,
  sideChild,
}: TreeNodeProps) {
  const hasChildren = Array.isArray(children) && children.length > 0;
  const [open, setOpen] = React.useState(true);
  const isOpen = collapsible ? open : true;
  const formation = childrenFormation ?? 'row';
  const connectorDims = useConnectorDimensions(children?.length || 0, formation);

  return (
    <div className="relative flex flex-col items-center">
      <Card className="w-42 shadow-md border-3 border-slate-200 bg-white z-10">
        <CardHeader className="p-3 flex flex-row justify-between items-center">
          <CardTitle className="text-md font-semibold text-center flex-1 text-slate-700">
            {label}
          </CardTitle>
          {collapsible && hasChildren && (
            <button 
              onClick={() => setOpen(!open)} 
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              {isOpen ? 
                <ChevronDown size={16} className="text-slate-600" /> : 
                <ChevronRight size={16} className="text-slate-600" />
              }
            </button>
          )}
        </CardHeader>
        {subtitle && (
          <CardContent className="pt-0 px-3 pb-3 text-xs text-slate-500 text-center font-medium">
            {subtitle}
          </CardContent>
        )}
      </Card>
      {sideChild && (
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 flex items-center ${
            sideChild.direction === 'right' ? 'left-full pl-4' : 'right-full pr-4'
          }`}
        >
          <div
            className="h-0.5 bg-slate-400"
            style={{ width: sideChild.connectorLength ?? 80 }}
          />
          <TreeNode
            {...sideChild.node}
            level={0}
            collapsible={collapsible}
          />
        </div>
      )}
      {hasChildren && isOpen && (
        <ConnectorContainer hasParent={true}>
          <Connector type="vertical-down" className="top-0" />
          {connectorDims.shouldRenderHorizontal && (
            <Connector 
              type="horizontal" 
              className="top-8" 
            />
          )}
          <div className={`mt-8 ${
            formation === 'grid' 
              ? `grid grid-cols-2 gap-6 justify-items-center`
              : 'flex space-x-8 justify-center'
          }`}>
            {children.length % 2 === 0 && children.map((child, idx) => (
              <TreeNode
                  key={idx}
                  {...child}
                  level={level + 1}
                  collapsible={collapsible}
                />
            ))}
            {children.length % 2 !== 0 && children.map((child, idx) => {    
                if (idx === children.length - 1) {
                    return (
                        <div className='col-span-2'>
                            <TreeNode
                            key={idx}
                            {...child}
                            level={level + 1}
                            collapsible={collapsible}
                        />
                        </div>
                    )
                }
                return <TreeNode
                  key={idx}
                  {...child}
                  level={level + 1}
                  collapsible={collapsible}
                />
            })}
          </div>
        </ConnectorContainer>
      )}
    </div>
  );
}
