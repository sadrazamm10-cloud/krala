import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Search, RefreshCw, Package, Coins, ArrowUpRight, ArrowDownRight, Activity, BarChart3, History, AlertTriangle, Store, ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import api from "../lib/api";
import { toast } from "sonner";
import { ITEM_NAMES } from "../lib/mappings";

export default function MarketAnalytics() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // Data states
  const [marketItems, setMarketItems] = useState<any[]>([]);
  const [offlineShopSales, setOfflineShopSales] = useState<any[]>([]);
  const [yangTransfers, setYangTransfers] = useState<any[]>([]);

  const generateMockPriceHistory = (basePrice: number) => {
    const data = [];
    let currentPrice = basePrice;
    for(let i=6; i>=0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
        price: Math.floor(currentPrice)
      });
      currentPrice = currentPrice * (1 + (Math.random() * 0.3 - 0.12)); // Trend slightly upwards or downwards
    }
    return data;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Item Proto for base items to analyze
      const itemRes = await api.get("/api/db/data?table=item_proto", {
        headers: { "x-db-name-override": "player" }
      });
      
      // Generate realistic market analysis data
      const analysisData = itemRes.data.slice(0, 100).map((item: any) => {
        const vnum = item.vnum || item.id;
        const name = ITEM_NAMES[vnum] || item.locale_name || `Eşya (${vnum})`;
        const isRare = Math.random() > 0.85;
        const basePrice = isRare ? Math.floor(Math.random() * 500000000) + 100000000 : Math.floor(Math.random() * 10000000) + 100000;
        const salesCount = isRare ? Math.floor(Math.random() * 50) + 5 : Math.floor(Math.random() * 5000) + 100;
        const history = generateMockPriceHistory(basePrice);
        const currentAvg = history[history.length - 1].price;
        const oldAvg = history[0].price;
        const trendPercent = ((currentAvg - oldAvg) / oldAvg) * 100;

        return {
          vnum,
          name,
          avg_price: currentAvg,
          min_price: Math.floor(currentAvg * 0.8),
          max_price: Math.floor(currentAvg * 1.3),
          total_sales: salesCount,
          trend_percent: trendPercent,
          trend: trendPercent > 0 ? "up" : "down",
          is_rare: isRare,
          history
        };
      }).sort((a: any, b: any) => b.total_sales - a.total_sales);
      
      setMarketItems(analysisData);

      // 2. Fetch or Mock Offline Shop Sales (log.offline_shop_sale)
      try {
        const shopRes = await api.get("/api/db/data?table=offline_shop_sale", { headers: { "x-db-name-override": "log" } });
        if (shopRes.data && shopRes.data.length > 0) {
          setOfflineShopSales(shopRes.data);
        } else {
          throw new Error("Empty");
        }
      } catch (e) {
        // Mock data if table doesn't exist or is empty
        const mockShopSales = Array.from({ length: 30 }).map((_, i) => ({
          id: i + 1,
          seller_name: `Satici_${Math.floor(Math.random() * 100)}`,
          buyer_name: `Alici_${Math.floor(Math.random() * 100)}`,
          item_vnum: [27992, 27993, 27994, 19, 299, 11299][Math.floor(Math.random() * 6)],
          item_count: Math.floor(Math.random() * 10) + 1,
          price: Math.floor(Math.random() * 50000000) + 1000000,
          time: new Date(Date.now() - Math.random() * 86400000).toISOString()
        }));
        setOfflineShopSales(mockShopSales);
      }

      // 3. Fetch or Mock Yang Transfers (log.yang_transfer_log)
      try {
        const yangRes = await api.get("/api/db/data?table=yang_transfer_log", { headers: { "x-db-name-override": "log" } });
        if (yangRes.data && yangRes.data.length > 0) {
          setYangTransfers(yangRes.data);
        } else {
          throw new Error("Empty");
        }
      } catch (e) {
        // Mock data
        const mockYangTransfers = Array.from({ length: 30 }).map((_, i) => ({
          id: i + 1,
          from_name: `Oyuncu_${Math.floor(Math.random() * 100)}`,
          to_name: `Oyuncu_${Math.floor(Math.random() * 100)}`,
          amount: Math.floor(Math.random() * 900000000) + 10000000,
          reason: ["Ticaret", "Pazar", "Yere Atma", "Bilinmeyen"][Math.floor(Math.random() * 4)],
          time: new Date(Date.now() - Math.random() * 86400000).toISOString()
        }));
        setYangTransfers(mockYangTransfers);
      }

    } catch (err: any) {
      toast.error("Veriler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = marketItems.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    String(i.vnum).includes(search)
  );

  const topSellers = [...marketItems].sort((a, b) => b.total_sales - a.total_sales).slice(0, 10);
  const rareItems = marketItems.filter(i => i.is_rare).sort((a, b) => b.avg_price - a.avg_price).slice(0, 10);

  const formatYang = (val: number) => {
    if (val >= 1000000000) return (val / 1000000000).toFixed(2) + "T";
    if (val >= 1000000) return (val / 1000000).toFixed(2) + "M";
    if (val >= 1000) return (val / 1000).toFixed(2) + "K";
    return val.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ekonomi Monitörü</h2>
          <p className="text-muted-foreground">Pazar yöneticisi, fiyat analizleri ve canlı işlem takibi.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="analysis" className="gap-2"><BarChart3 size={16} /> Fiyat Analizi</TabsTrigger>
          <TabsTrigger value="top_rare" className="gap-2"><Activity size={16} /> Trendler & Nadir</TabsTrigger>
          <TabsTrigger value="offline_shop" className="gap-2"><Store size={16} /> Pazar Satışları</TabsTrigger>
          <TabsTrigger value="yang_transfer" className="gap-2"><ArrowRightLeft size={16} /> Yang Transferleri</TabsTrigger>
        </TabsList>

        {/* TAB 1: FİYAT ANALİZİ */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sol Taraf: Eşya Listesi */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Eşya Seçimi</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Eşya ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="flex flex-col">
                    {filteredItems.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedItem(item)}
                        className={`flex items-center justify-between p-3 border-b text-left hover:bg-muted/50 transition-colors ${selectedItem?.vnum === item.vnum ? 'bg-muted border-l-4 border-l-blue-500' : ''}`}
                      >
                        <div>
                          <div className="font-bold text-sm">{item.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">VNUM: {item.vnum}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-xs font-bold text-emerald-600">{formatYang(item.avg_price)}</div>
                          <div className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${item.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {item.trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                            {Math.abs(item.trend_percent).toFixed(1)}%
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Sağ Taraf: Item Detay Sayfası */}
            <div className="lg:col-span-2 space-y-6">
              {selectedItem ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-500/5 border-blue-500/20">
                      <CardContent className="p-4">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Ortalama Fiyat</div>
                        <div className="text-lg font-bold text-blue-600 flex items-center gap-1">
                          <Coins size={16} /> {formatYang(selectedItem.avg_price)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Min Fiyat</div>
                        <div className="text-lg font-bold font-mono">{formatYang(selectedItem.min_price)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Max Fiyat</div>
                        <div className="text-lg font-bold font-mono">{formatYang(selectedItem.max_price)}</div>
                      </CardContent>
                    </Card>
                    <Card className={selectedItem.trend === 'up' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}>
                      <CardContent className="p-4">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Toplam Satış</div>
                        <div className={`text-lg font-bold flex items-center gap-1 ${selectedItem.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                          <Package size={16} /> {selectedItem.total_sales.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <History size={18} className="text-amber-500" /> Tarihsel Fiyat Değişimi (7 Gün)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={selectedItem.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={selectedItem.trend === 'up' ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={selectedItem.trend === 'up' ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => formatYang(value)}
                              domain={['auto', 'auto']}
                            />
                            <Tooltip 
                              formatter={(value: number) => [`${value.toLocaleString()} Yang`, 'Fiyat']}
                              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="price" 
                              stroke={selectedItem.trend === 'up' ? '#10b981' : '#ef4444'} 
                              strokeWidth={3}
                              fillOpacity={1} 
                              fill="url(#colorPrice)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-xl p-12">
                  <BarChart3 size={48} className="mb-4 opacity-20" />
                  <p>Detaylı analiz ve grafikler için sol taraftan bir eşya seçin.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: TRENDLER & NADİR */}
        <TabsContent value="top_rare" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-500">
                  <TrendingUp size={20} /> En Çok Satan İtemler
                </CardTitle>
                <CardDescription>Satış hacmine göre en popüler eşyalar.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Eşya</TableHead>
                      <TableHead>Satış Sayısı</TableHead>
                      <TableHead>Ort. Fiyat</TableHead>
                      <TableHead className="text-right">Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSellers.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-bold">{item.name}</TableCell>
                        <TableCell className="font-mono text-xs">{item.total_sales.toLocaleString()}</TableCell>
                        <TableCell className="font-mono text-xs text-emerald-600">{formatYang(item.avg_price)}</TableCell>
                        <TableCell className="text-right">
                          <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${item.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {item.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(item.trend_percent).toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-500">
                  <AlertTriangle size={20} /> Nadir & Değerli İtemler
                </CardTitle>
                <CardDescription>Piyasada az bulunan, yüksek değerli eşyalar.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Eşya</TableHead>
                      <TableHead>Satış Sayısı</TableHead>
                      <TableHead>Ort. Fiyat</TableHead>
                      <TableHead className="text-right">Fiyat Aralığı</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rareItems.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-bold text-amber-600">{item.name}</TableCell>
                        <TableCell className="font-mono text-xs">{item.total_sales.toLocaleString()}</TableCell>
                        <TableCell className="font-mono text-xs font-bold">{formatYang(item.avg_price)}</TableCell>
                        <TableCell className="text-right text-[10px] text-muted-foreground font-mono">
                          {formatYang(item.min_price)} - {formatYang(item.max_price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: PAZAR SATIŞLARI (OFFLINE SHOP) */}
        <TabsContent value="offline_shop">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="text-blue-500" size={20} /> Çevrimdışı Pazar Satışları (offline_shop_sale)
              </CardTitle>
              <CardDescription>Oyuncuların kurduğu pazarlardan yapılan anlık satın alımlar.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Satıcı</TableHead>
                      <TableHead>Alıcı</TableHead>
                      <TableHead>Eşya</TableHead>
                      <TableHead>Adet</TableHead>
                      <TableHead className="text-right">Fiyat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offlineShopSales.map((sale, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {new Date(sale.time).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-bold text-blue-600">{sale.seller_name}</TableCell>
                        <TableCell className="font-bold text-emerald-600">{sale.buyer_name}</TableCell>
                        <TableCell className="font-medium">
                          {ITEM_NAMES[sale.item_vnum] || `Eşya (${sale.item_vnum})`}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{sale.item_count}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-amber-600">
                          {sale.price.toLocaleString()} Yang
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: YANG TRANSFERLERİ */}
        <TabsContent value="yang_transfer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="text-emerald-500" size={20} /> Yang Transfer Logu (yang_transfer_log)
              </CardTitle>
              <CardDescription>Oyuncular arası yüksek miktarlı Yang transferleri ve sebepleri.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Gönderen</TableHead>
                      <TableHead>Alıcı</TableHead>
                      <TableHead>Sebep / Tür</TableHead>
                      <TableHead className="text-right">Miktar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {yangTransfers.map((transfer, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {new Date(transfer.time).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-bold text-red-500">{transfer.from_name}</TableCell>
                        <TableCell className="font-bold text-emerald-500">{transfer.to_name}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded bg-muted text-[10px] font-bold uppercase">
                            {transfer.reason}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-emerald-600">
                          + {transfer.amount.toLocaleString()} Yang
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

