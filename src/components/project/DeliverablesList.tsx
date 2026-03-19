import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Download, File as FileIcon, LoaderCircle, Trash2, Upload } from 'lucide-react';

interface DeliverablesListProps {
  projectId: string;
}

interface WebFile {
  name: string;
  size: number;
  created_at: string;
}

export const DeliverablesList: React.FC<DeliverablesListProps> = ({ projectId }) => {
  const { canManagePortal } = useAuth();
  const [files, setFiles] = useState<WebFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage.from('deliverables').list(projectId);
      if (error) throw error;
      
      const validFiles = data?.filter(file => file.name !== '.emptyFolderPlaceholder') || [];
      
      setFiles(validFiles.map(f => ({
        name: f.name,
        size: f.metadata?.size || 0,
        created_at: f.created_at || new Date().toISOString()
      })));
    } catch (error) {
      console.error('Error fetching files:', error);
      // Fail silently for users without bucket setup yet, but log to console
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchFiles();
  }, [projectId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const filePath = `${projectId}/${file.name}`;
      const { error } = await supabase.storage.from('deliverables').upload(filePath, file, {
        upsert: true
      });

      if (error) throw error;

      toast.success('File uploaded successfully');
      await fetchFiles();
    } catch (error) {
      toast.error('Error uploading file. Ensure the "deliverables" bucket is created and public in Supabase Storage.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (fileName: string) => {
    try {
      const { data, error } = await supabase.storage.from('deliverables').download(`${projectId}/${fileName}`);
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!window.confirm(`Delete ${fileName}?`)) return;

    try {
      const { error } = await supabase.storage.from('deliverables').remove([`${projectId}/${fileName}`]);
      if (error) throw error;

      toast.success('File deleted');
      await fetchFiles();
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return <div className="p-8 text-center"><LoaderCircle className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <FileIcon className="h-5 w-5 text-primary" />
          Deliverables & Files
        </h2>
        {canManagePortal && (
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {isUploading ? <LoaderCircle className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              Upload File
            </Button>
          </div>
        )}
      </div>

      {files.length > 0 ? (
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/30 p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button type="button" variant="ghost" size="sm" onClick={() => handleDownload(file.name)}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
                {canManagePortal && (
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(file.name)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-background/30 p-8 text-center text-sm text-muted-foreground whitespace-pre-line">
          No deliverable files uploaded yet.
          {canManagePortal && '\n(Admins: ensure you created a public "deliverables" bucket in Supabase Storage)'}
        </div>
      )}
    </div>
  );
};
