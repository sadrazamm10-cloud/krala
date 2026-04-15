import { useState, useEffect } from "react";
import { Database, Table as TableIcon, Search, RefreshCw, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function DatabaseManager() {
  const [databases] = useState(["player", "account", "common", "log"]);
  const [selectedDb, setSelectedDb] = useState("player");
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchTables = async () => {
    try {
      const res = await api.get("/api/db/tables", {
        headers: { "x-db-name-override": selectedDb }
      });
      setTables(res.data);
    } catch (err: any) {
      toast.error("Tablolar yüklenemedi: " + err.message);
    }
  };

  const fetchTableData = async (tableName: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/db/data?table=${tableName}`, {
        headers: { "x-db-name-override": selectedDb }
      });
      setData(res.data);
      setSelectedTable(tableName);
    } catch (err: any) {
      toast.error("Veriler yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [selectedDb]);

  const filteredData = data.filter(row => 
    Object.values(row).some(val => String(val).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Veritabanı Yönetimi</h2>
          <div className="flex bg-muted p-1 rounded-md">
            {databases.map(db => (
              <button
                key={db}
                onClick={() => setSelectedDb(db)}
                className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${
                  selectedDb === db ? "bg-background shadow-sm" : "hover:text-primary"
                }`}
              >
                {db}
              </button>
            ))}
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={fetchTables}>
          <RefreshCw size={18} />
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Table List */}
        <Card className="col-span-3 flex flex-col overflow-hidden">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium opacity-70 uppercase tracking-widest">Tablolar</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="divide-y">
                {tables.map((t, i) => {
                  const tableName = Object.values(t)[0] as string;
                  return (
                    <div
                      key={i}
                      onClick={() => fetchTableData(tableName)}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-muted cursor-pointer transition-colors ${
                        selectedTable === tableName ? "bg-primary/10 text-primary" : ""
                      }`}
                    >
                      <TableIcon size={16} />
                      <span className="text-sm font-medium">{tableName}</span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Data View */}
        <Card className="col-span-9 flex flex-col overflow-hidden">
          <CardHeader className="py-4 flex flex-row items-center justify-between border-b">
            <CardTitle className="text-sm font-medium opacity-70 uppercase tracking-widest">
              {selectedTable ? `${selectedTable} Verileri` : "Tablo Seçin"}
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            {selectedTable ? (
              <ScrollArea className="h-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {data.length > 0 && Object.keys(data[0]).map(key => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((row, i) => (
                      <TableRow key={i}>
                        {Object.values(row).map((val: any, j) => (
                          <TableCell key={j} className="max-w-[200px] truncate">
                            {String(val)}
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit2 size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground italic">
                Verileri görüntülemek için soldan bir tablo seçin
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
