import React, { useState, useEffect } from "react";
import { Folder, File, ChevronRight, ChevronLeft, Save, Play, RefreshCw, Trash2, FolderPlus, FilePlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Input } from "../components/ui/input";
import Editor from "@monaco-editor/react";
import api from "../lib/api";
import { toast } from "sonner";
import { useAppContext } from "../context/AppContext";

interface FileItem {
  name: string;
  isDirectory: boolean;
  size: number;
  mtime: number;
}

export default function FileExplorer() {
  const { sshPaths } = useAppContext();
  const defaultPath = sshPaths["game_dir"] || "/usr/game";
  const [currentPath, setCurrentPath] = useState(defaultPath);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);

  const fetchFiles = async (path: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/files?path=${path}`);
      setFiles(res.data);
      setCurrentPath(path);
    } catch (err: any) {
      toast.error("Dosyalar yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, []);

  const handleFileClick = async (file: FileItem) => {
    const newPath = `${currentPath}/${file.name}`.replace(/\/+/g, "/");
    if (file.isDirectory) {
      fetchFiles(newPath);
    } else {
      setSelectedFile(newPath);
      try {
        const res = await api.get(`/api/files/read?path=${newPath}`);
        setFileContent(res.data.content);
        setIsEditing(true);
      } catch (err: any) {
        toast.error("Dosya okunamadı: " + err.message);
      }
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    try {
      await api.post("/api/files/write", { path: selectedFile, content: fileContent });
      toast.success("Dosya başarıyla kaydedildi");
    } catch (err: any) {
      toast.error("Dosya kaydedilemedi: " + err.message);
    }
  };

  const handleDelete = async (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const pathToDelete = `${currentPath}/${fileName}`.replace(/\/+/g, "/");
    if (!confirm(`${fileName} silinecek, emin misiniz?`)) return;

    try {
      await api.delete("/api/files", { data: { path: pathToDelete } });
      toast.success("Silindi");
      fetchFiles(currentPath);
    } catch (err: any) {
      toast.error("Silinemedi: " + err.message);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    const newPath = `${currentPath}/${newFolderName}`.replace(/\/+/g, "/");
    try {
      await api.post("/api/files/mkdir", { path: newPath });
      toast.success("Klasör oluşturuldu");
      setNewFolderName("");
      setShowNewFolder(false);
      fetchFiles(currentPath);
    } catch (err: any) {
      toast.error("Oluşturulamadı: " + err.message);
    }
  };

  const goBack = () => {
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    const parentPath = "/" + parts.join("/");
    fetchFiles(parentPath || "/");
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={goBack}>
            <ChevronLeft size={20} />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{currentPath}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowNewFolder(!showNewFolder)} className="gap-2">
            <FolderPlus size={16} /> Yeni Klasör
          </Button>
          {isEditing && (
            <Button onClick={handleSave} className="gap-2">
              <Save size={18} /> Kaydet
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => fetchFiles(currentPath)}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {showNewFolder && (
        <Card className="p-4 flex gap-2 items-center bg-muted/30">
          <Input 
            placeholder="Klasör Adı" 
            value={newFolderName} 
            onChange={(e) => setNewFolderName(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleCreateFolder}>Oluştur</Button>
          <Button variant="ghost" onClick={() => setShowNewFolder(false)}>İptal</Button>
        </Card>
      )}

      <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* File List */}
        <Card className="col-span-4 flex flex-col overflow-hidden">
          <CardHeader className="border-bottom py-4">
            <CardTitle className="text-sm font-medium opacity-70 uppercase tracking-widest">Dosyalar</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="divide-y">
                {files.map((file) => (
                  <div
                    key={file.name}
                    onClick={() => handleFileClick(file)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted cursor-pointer transition-colors group"
                  >
                    {file.isDirectory ? (
                      <Folder size={18} className="text-blue-500 fill-blue-500/20" />
                    ) : (
                      <File size={18} className="text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate text-sm font-medium">{file.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDelete(file.name, e)}
                      >
                        <Trash2 size={14} />
                      </Button>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="col-span-8 flex flex-col overflow-hidden">
          <CardHeader className="border-bottom py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium opacity-70 uppercase tracking-widest">
              {selectedFile ? selectedFile.split("/").pop() : "Dosya Seçilmedi"}
            </CardTitle>
            {selectedFile?.endsWith(".quest") && (
              <Button size="sm" variant="secondary" className="gap-2">
                <Play size={14} /> Quest Okut
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-1 bg-[#1e1e1e]">
            {isEditing ? (
              <Editor
                height="100%"
                defaultLanguage="cpp"
                theme="vs-dark"
                value={fileContent}
                onChange={(value) => setFileContent(value || "")}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground italic">
                Düzenlemek için bir dosya seçin
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
