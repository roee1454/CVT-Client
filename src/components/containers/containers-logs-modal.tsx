import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useEffect, useState, useRef, useCallback } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {  
  Square, 
  AlertCircle, 
  PlayCircle, 
  RotateCcw, 
  StopCircle, 
  Trash2,
  Download,
  Maximize2,
  Minimize2,
  Copy,
  Terminal,
  Hammer,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  Search
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/lib/axios";
import { toast } from "sonner";
import { ContainerRecord } from "@/types";

interface ContainerLogsDialogProps {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  container: ContainerRecord
  endpoint: string;
}

export default function ContainerLogsDialog({ 
  open, 
  onOpenChange, 
  container,
  endpoint
}: ContainerLogsDialogProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [containerState, setContainerState] = useState<string>('');
  const [containerId, setContainerId] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [actionContainerId, setActionContainerId] = useState<string | null>(null);

  const client = useQueryClient();

  const resetStates = useCallback(() => {
    setLogs([]);
    setIsConnected(false);
    setIsRunning(false);
    setIsBuilding(false);
    setIsMaximized(false);
    setContainerState('');
    setActionContainerId(null);
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (open) {
      resetStates();
      if (container.containerId) {
        setContainerId(container.containerId);
      }
    }
  }, [open, container.buildId, container.containerId, resetStates]);

  const { data: _, refetch: refetchContainerState } = useQuery({
    queryKey: ['container-state', containerId],
    queryFn: async () => {
      if (!containerId || isBuilding) return null;
      const response = await axiosClient.get(`/docker/container/state/${containerId}`);
      const state = response.data;
      setContainerState(state);

      setIsRunning(state === "running")
      return state;
    },
    enabled: !isBuilding && containerId !== null && open,
    refetchInterval: 3000,
  });

  const { mutate: stopContainer, isPending: isStopping } = useMutation({ 
    mutationKey: ['containers'],
    async mutationFn(id: string) {
      setActionContainerId(id);
      await axiosClient.get(`/docker/container/stop/${id}`);
    },
    onError(error: any) {
      toast.error("נכשל בעת עצירת הקונטיינר", {
        description: error.message,
        icon: <AlertCircle className="h-4 w-4" />
      });
      setActionContainerId(null);
    },
    async onSuccess() {
      await client.invalidateQueries({ queryKey: ['containers'] });
      await refetchContainerState();
      setActionContainerId(null);
      toast.success("קונטיינר נעצר בהצלחה!", {
        icon: <StopCircle className="h-4 w-4" />
      });
    }
  });

  const { mutate: startContainer, isPending: isStarting } = useMutation({ 
    mutationKey: ['containers'],
    async mutationFn(id: string) {
      setActionContainerId(id);
      await axiosClient.get(`/docker/container/start/${id}`);
    },
    onError(error: any) {
      toast.error("נכשל בעת התחלת הקונטיינר", {
        description: error.message,
        icon: <AlertCircle className="h-4 w-4" />
      });
      setActionContainerId(null);
    },
    async onSuccess() {
      await client.invalidateQueries({ queryKey: ['containers'] });
      await refetchContainerState();
      setActionContainerId(null);
      toast.success("קונטיינר התחיל לעבוד בהצלחה!", {
        icon: <PlayCircle className="h-4 w-4" />
      });
    }
  });

  const { mutate: restartContainer, isPending: isRestarting } = useMutation({ 
    mutationKey: ['containers'],
    async mutationFn(id: string) {
      setActionContainerId(id);
      await axiosClient.get(`/docker/container/restart/${id}`);
    },
    onError(error: any) {
      toast.error("נכשל באיתחול הקונטיינר", {
        description: error.message,
        icon: <AlertCircle className="h-4 w-4" />
      });
      setActionContainerId(null);
    },
    async onSuccess() {
      await client.invalidateQueries({ queryKey: ['containers'] });
      await refetchContainerState();
      setActionContainerId(null);
      toast.success("קונטיינר אותחל בהצלחה!", { 
        icon: <RotateCcw className="h-4 w-4" />
      });
    }
  });

  const { mutate: removeContainer, isPending: isRemoving } = useMutation({ 
    mutationKey: ['containers'],
    async mutationFn(id: string) {
      setActionContainerId(id);
      await axiosClient.get(`/docker/container/remove/${id}`);
    },
    onError(error: any) {
      toast.error("נכשל במחיקת קונטיינר", {
        description: error.message,
        icon: <AlertCircle className="h-4 w-4" />
      });
      setActionContainerId(null);
    },
    async onSuccess() {
      await client.invalidateQueries({ queryKey: ['containers'] });
      setActionContainerId(null);
      toast.success("קונטיינר נמחק בהצלחה", {
        icon: <Trash2 className="h-4 w-4" />
      });
      onOpenChange(false);
    }
  });

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollElement = 
          scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') ||
          scrollAreaRef.current.querySelector('.scroll-area-viewport') ||
          scrollAreaRef.current.querySelector('[data-viewport]') ||
          scrollAreaRef.current;
        
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
          
          const lastLog = scrollElement.querySelector('div:last-child');
          if (lastLog) {
            lastLog.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        }
      }
    };

    requestAnimationFrame(() => {
      scrollToBottom();
      setTimeout(scrollToBottom, 50);
    });
  }, [logs]);

  useEffect(() => {
    if (!open || !container.buildId) return;

    const eventSource = new EventSource(endpoint, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setLogs(prev => [...prev, `🔗 מתחבר לקונטיינר ${container.name || container.buildId}...`]);
    };

    eventSource.onmessage = (event) => {
      const logLine = event.data?.trim();
      if (!logLine) return;
      
      if (logLine === '[BUILD_START]') {
        setLogs(prev => [...prev, '🔨 מתחיל תהליך בנייה...']);
        setIsBuilding(true);
        setIsRunning(false);
        return;
      }
      
      if (logLine.startsWith('[CONTAINER_ID]') || logLine.includes('ContainerId-')) {
        const idMatch = logLine.match(/ContainerId-(.+)/) || logLine.split('-');
        if (idMatch && idMatch[1]) {
          const newContainerId = idMatch[1];
          setContainerId(newContainerId);
          setLogs(prev => [...prev, `📋 מזהה קונטיינר: ${newContainerId.slice(0, 12)}...`]);
        }
        return;
      }

      if (logLine === '[BUILD_COMPLETE]') {
        setLogs(prev => [...prev, '✅ תהליך הבנייה הושלם בהצלחה']);
        setIsBuilding(false);
        setTimeout(() => {
          refetchContainerState();
        }, 1000);
        return;
      }
      
      if (logLine === '[BUILD_ERROR]') {
        setLogs(prev => [...prev, '❌ תהליך הבנייה נכשל']);
        setIsBuilding(false);
        return;
      }
      
      if (logLine === '[CONTAINER_START]') {
        setLogs(prev => [...prev, '🚀 הקונטיינר מתחיל לעבוד...']);
        setTimeout(() => {
          refetchContainerState();
        }, 500);
        return;
      }
      
      if (logLine === '[CONTAINER_STOP]') {
        setLogs(prev => [...prev, '⏹️ הקונטיינר נעצר']);
        setIsRunning(false);
        setTimeout(() => {
          refetchContainerState();
        }, 500);
        return;
      }
      
      if (logLine === '[CONTAINER_ERROR]') {
        setLogs(prev => [...prev, '❌ שגיאה בקונטיינר']);
        setIsRunning(false);
        return;
      }

      if (!isBuilding && (
        logLine.toLowerCase().includes('building') || 
        logLine.toLowerCase().includes('dockerfile') ||
        logLine.includes('Step ') ||
        logLine.includes('---> ')
      )) {
        if (!isBuilding) {
          setLogs(prev => [...prev, '🔨 זוהה תחילת תהליך בנייה...']);
          setIsBuilding(true);
          setIsRunning(false);
        }
      }

      setLogs(prev => [...prev, logLine]);
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setIsConnected(false);
      if (isBuilding) {
        setLogs(prev => [...prev, '⚠️ חיבור SSE נותק במהלך בנייה']);
      }
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [open, endpoint, container.buildId, isBuilding, refetchContainerState]);

  useEffect(() => {
    if (!open) {
      resetStates();
    }
  }, [open, resetStates]);

  const handleStopLogs = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      setLogs(prev => [...prev, '⏹️ הפסקת הצגת לוגים']);
    }
  };

  const handleCopyLogs = () => {
    const logsText = logs.join('\n');
    navigator.clipboard.writeText(logsText).then(() => {
      toast.success("לוגים הועתקו ללוח", {
        icon: <Copy className="h-4 w-4" />
      });
    });
  };

  const handleDownloadLogs = () => {
    const logsText = logs.join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${container.name || container.buildId}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = () => {
    if (isBuilding) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Hammer className="w-3 h-3 animate-pulse" />
          בבנייה
        </Badge>
      );
    }

    const stateTranslations: { [key: string]: { text: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode } } = {
      'running': { text: 'פועל', variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
      'exited': { text: 'נעצר', variant: 'secondary', icon: <XCircle className="w-3 h-3" /> },
      'paused': { text: 'מושהה', variant: 'outline', icon: <Pause className="w-3 h-3" /> },
      'restarting': { text: 'מתחיל מחדש', variant: 'secondary', icon: <RotateCcw className="w-3 h-3 animate-spin" /> },
      'dead': { text: 'מת', variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
      'created': { text: 'נוצר', variant: 'outline', icon: <Clock className="w-3 h-3" /> },
    };

    const statusInfo = stateTranslations[containerState] || { text: containerState || 'לא ידוע', variant: 'outline' as const, icon: <AlertCircle className="w-3 h-3" /> };

    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        {statusInfo.icon}
        {statusInfo.text}
      </Badge>
    );
  };

  const actionsDisabled = isBuilding || !containerId || !["running", "exited", "paused", "restarting", "dead", "created"].includes(containerState);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`flex flex-col  transition-all duration-200 ${
          isMaximized 
            ? 'w-[80vw] h-[80vh] sm:max-w-3xl max-w-[80vw] max-h-[80vh]' 
            : 'h-[65vh]'
        }`}
      >
        <DialogHeader className="flex-shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <Terminal className="h-5 w-5" />
                חלון שליטה לקונטיינר
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>{container.name || 'ללא שם'}</span>
                <span>•</span>
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  {container.buildId?.slice(0, 12) || 'N/A'}
                </code>
                <span>•</span>
                {getStatusBadge()}
              </div>
            </div>
            
            <div className="flex items-center gap-2">              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-2"
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-3">

            {!["running", "exited", "paused", "restarting", "dead", "created"].includes(containerState) && !isBuilding && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Search className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">מחפש עדכונים..</span>
                </div>
                <p className="text-xs text-blue-700 text-right mt-1">
                  פעולות שליטה בקונטיינר אינן זמינות במהלך חיפוש עדכונים
                </p>
              </div>
            )}
            
            {isBuilding && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Hammer className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">תהליך בנייה מתבצע כעת</span>
                </div>
                <p className="text-xs text-right text-yellow-700 mt-1">
                  פעולות שליטה בקונטיינר אינן זמינות במהלך תהליך הבנייה
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => containerId && startContainer(containerId)}
                disabled={actionsDisabled || isStarting || actionContainerId === containerId || isRunning}
                className="flex items-center gap-1"
              >
                <PlayCircle className="w-3 h-3" />
                התחל
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => containerId && stopContainer(containerId)}
                disabled={actionsDisabled || isStopping || actionContainerId === containerId || !isRunning}
                className="flex items-center gap-1"
              >
                <StopCircle className="w-3 h-3" />
                עצור
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => containerId && restartContainer(containerId)}
                disabled={actionsDisabled || isRestarting || actionContainerId === containerId}
                className="flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                אתחל
              </Button>

              <Separator orientation="vertical" className="h-6" />

              <Button
                variant="destructive"
                size="sm"
                onClick={() => containerId && removeContainer(containerId)}
                disabled={actionsDisabled || isRemoving || actionContainerId === containerId}
                className="flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                מחק
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLogs}
                disabled={logs.length === 0}
                className="flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                העתק לוגים
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadLogs}
                disabled={logs.length === 0}
                className="flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                הורד לוגים
              </Button>

              {isConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStopLogs}
                  className="flex items-center gap-1"
                >
                  <Square className="w-3 h-3" />
                  עצור לוגים
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          <ScrollArea 
            className="h-full w-full border rounded-lg bg-slate-950"
            ref={scrollAreaRef}
          >
            <div className="p-4 font-mono text-sm space-y-1 bg-slate-950 text-green-400 min-h-full">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic text-center py-8">
                  {containerId ? 'מחכה ללוגים...' : 'לא נמצא מזהה קונטיינר'}
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex text-xs sm:text-sm leading-relaxed">
                    <span className="text-slate-600 mr-3 flex-shrink-0 min-w-[70px]">
                      [{new Date().toLocaleTimeString('he-IL')}]
                    </span>
                    <span className="whitespace-pre-wrap break-words flex-1">
                      {log}
                    </span>
                  </div>
                ))
              )}
              
              {isConnected && (isRunning || isBuilding) && (
                <div className="flex items-center gap-2 text-yellow-400 py-2">
                  <div className="animate-spin w-3 h-3 border border-yellow-400 border-t-transparent rounded-full" />
                  <span className="text-sm">
                    {isBuilding ? 'מבצע בנייה...' : 'מקבל לוגים בזמן אמת...'}
                  </span>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-3 text-xs text-muted-foreground border-t">
          <div className="flex items-center gap-4">
            <span>{logs.length} שורות לוג</span>
            <span>
              מצב: {isBuilding ? 'בבנייה' : isRunning ? 'פועל' : isConnected ? 'מחובר' : 'לא מחובר'}
            </span>
            {containerState && !isBuilding && (
              <span>סטטוס: {containerState}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            {(isStopping || isStarting || isRestarting || isRemoving || isBuilding) && (
              <>
                <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full" />
                <span>
                  {isBuilding ? 'מבצע בנייה...' : 'מבצע פעולה...'}
                </span>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}