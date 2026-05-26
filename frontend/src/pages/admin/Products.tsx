import { useMemo, useRef, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useProducts } from "@/context/ProductsContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Plus, Trash2, RefreshCw, Search, Upload, Loader2, X, ImagePlus, Star } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload";

type FormState = Omit<Product, "id"> & { images: string[] };
const empty: FormState = { name: "", price: 0, description: "", image: "", images: [], stock: 0, category: "" };

type StockFilter = "all" | "in" | "low" | "out";

const MAX_GALLERY = 5; // showcase photos shown when product is selected

const ProductsAdmin = () => {
  const { products, create, update, remove, reset } = useProducts();
  const { format } = useCurrency();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sort, setSort] = useState<"newest" | "price-asc" | "price-desc" | "stock-asc">("newest");
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [mainUploading, setMainUploading] = useState(false);
  const [mainPct, setMainPct] = useState(0);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryPct, setGalleryPct] = useState(0);
  const mainRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const filtered = useMemo(() => {
    let list = products.filter((p) =>
      [p.name, p.category, p.description].some((s) => s.toLowerCase().includes(query.toLowerCase()))
    );
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (stockFilter === "in") list = list.filter((p) => p.stock > 10);
    if (stockFilter === "low") list = list.filter((p) => p.stock > 0 && p.stock <= 10);
    if (stockFilter === "out") list = list.filter((p) => p.stock === 0);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "stock-asc") list = [...list].sort((a, b) => a.stock - b.stock);
    return list;
  }, [products, query, category, stockFilter, sort]);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ ...p, images: p.images ?? [] });
    setOpen(true);
  };

  const onMainFile = async (f: File) => {
    setMainUploading(true); setMainPct(0);
    try {
      const url = await uploadImage(f, setMainPct);
      setForm((s) => ({ ...s, image: url }));
      toast.success("Main image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally { setMainUploading(false); }
  };

  const onGalleryFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const remaining = MAX_GALLERY - form.images.length;
    if (remaining <= 0) { toast.error(`Up to ${MAX_GALLERY} showcase photos`); return; }
    const take = arr.slice(0, remaining);
    setGalleryUploading(true); setGalleryPct(0);
    try {
      for (let i = 0; i < take.length; i++) {
        const url = await uploadImage(take[i], (p) => setGalleryPct(Math.round(((i + p / 100) / take.length) * 100)));
        setForm((s) => ({ ...s, images: [...s.images, url] }));
      }
      toast.success(`${take.length} photo${take.length > 1 ? "s" : ""} added`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally { setGalleryUploading(false); setGalleryPct(0); }
  };

  const removeGalleryAt = (i: number) =>
    setForm((s) => ({ ...s, images: s.images.filter((_, idx) => idx !== i) }));

  const promoteToMain = (i: number) =>
    setForm((s) => {
      const next = [...s.images];
      const promoted = next.splice(i, 1)[0];
      const oldMain = s.image;
      return { ...s, image: promoted, images: oldMain ? [oldMain, ...next] : next };
    });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.image || form.price < 0 || form.stock < 0) {
      return toast.error("Please complete all fields and add a main image");
    }
    const payload: Omit<Product, "id"> = {
      name: form.name, price: form.price, description: form.description,
      image: form.image, images: form.images, stock: form.stock, category: form.category,
    };
    if (editing) update(editing.id, payload);
    else create(payload);
    setOpen(false);
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-primary font-semibold uppercase tracking-wider">Catalog</p>
          <h1 className="text-3xl font-bold text-secondary">Products</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset} className="gap-2"><RefreshCw className="h-4 w-4" /> Reset</Button>
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 gap-2"><Plus className="h-4 w-4" /> New product</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-3 md:grid-cols-4 mb-6">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as StockFilter)}>
          <SelectTrigger><SelectValue placeholder="Stock" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stock</SelectItem>
            <SelectItem value="in">In stock (&gt;10)</SelectItem>
            <SelectItem value="low">Low stock (1-10)</SelectItem>
            <SelectItem value="out">Out of stock</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="text-sm text-muted-foreground">{filtered.length} of {products.length} products</p>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
            <SelectItem value="stock-asc">Stock: low to high</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="p-3 font-semibold">Product</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Photos</th>
                <th className="p-3 font-semibold">Price</th>
                <th className="p-3 font-semibold">Stock</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const photoCount = 1 + (p.images?.length ?? 0);
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} loading="lazy" className="h-12 w-12 rounded-md object-cover bg-muted" />
                        <div>
                          <p className="font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.category}</td>
                    <td className="p-3 text-muted-foreground">{photoCount} {photoCount === 1 ? "photo" : "photos"}</td>
                    <td className="p-3 font-semibold text-secondary">{format(p.price)}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.stock > 10 ? "bg-green-100 text-green-700" : p.stock > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      }`}>{p.stock} in stock</span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete "{p.name}"?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => remove(p.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Price ($)</Label><Input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} required /></div>
              <div><Label>Stock</Label><Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} required /></div>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={categories.includes(form.category) ? form.category : (form.category ? "__new" : "")}
                onValueChange={(v) => setForm({ ...form, category: v === "__new" ? "" : v })}
              >
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  <SelectItem value="__new">+ Add new category</SelectItem>
                </SelectContent>
              </Select>
              {(!categories.includes(form.category)) && (
                <Input
                  className="mt-2"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="New category name"
                  required
                />
              )}
            </div>

            {/* Main image */}
            <div>
              <Label>Main photo <span className="text-xs text-muted-foreground font-normal">(shown on cards)</span></Label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onMainFile(f); }}
                onClick={() => !mainUploading && mainRef.current?.click()}
                className="mt-1 cursor-pointer rounded-lg border-2 border-dashed border-border hover:border-primary/60 transition-colors p-4 flex items-center gap-4"
              >
                <div className="h-20 w-20 rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center shrink-0">
                  {form.image
                    ? <img src={form.image} alt="preview" className="h-full w-full object-cover" />
                    : <Upload className="h-6 w-6 text-muted-foreground" />}
                </div>
                <div className="flex-1 text-sm">
                  {mainUploading ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Uploading {mainPct}%
                      </div>
                      <Progress value={mainPct} className="h-2" />
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-foreground">Click or drop the main image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to ~5MB</p>
                    </>
                  )}
                </div>
              </div>
              <input ref={mainRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && onMainFile(e.target.files[0])} />
              <Input
                className="mt-2"
                value={form.image.startsWith("data:") ? "" : form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="…or paste main image URL"
                disabled={mainUploading}
              />
            </div>

            {/* Showcase gallery */}
            <div>
              <Label>
                Showcase photos
                <span className="text-xs text-muted-foreground font-normal"> (shown on product page · up to {MAX_GALLERY})</span>
              </Label>

              {form.images.length > 0 && (
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {form.images.map((src, i) => (
                    <div key={src + i} className="relative aspect-square rounded-md overflow-hidden border border-border group bg-muted">
                      <img src={src} alt={`Showcase ${i + 1}`} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                        <button type="button" onClick={() => promoteToMain(i)}
                          className="p-1.5 rounded-md bg-background/90 hover:bg-background" title="Set as main">
                          <Star className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => removeGalleryAt(i)}
                          className="p-1.5 rounded-md bg-destructive text-destructive-foreground hover:opacity-90" title="Remove">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.length) onGalleryFiles(e.dataTransfer.files); }}
                onClick={() => !galleryUploading && form.images.length < MAX_GALLERY && galleryRef.current?.click()}
                className={`mt-2 rounded-lg border-2 border-dashed border-border p-3 flex items-center gap-3 text-sm transition-colors ${
                  form.images.length >= MAX_GALLERY ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary/60"
                }`}
              >
                <ImagePlus className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  {galleryUploading ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Uploading {galleryPct}%
                      </div>
                      <Progress value={galleryPct} className="h-2" />
                    </div>
                  ) : form.images.length >= MAX_GALLERY ? (
                    <p className="text-muted-foreground">Gallery full ({MAX_GALLERY}/{MAX_GALLERY})</p>
                  ) : (
                    <>
                      <p className="font-medium text-foreground">Add more photos ({form.images.length}/{MAX_GALLERY})</p>
                      <p className="text-xs text-muted-foreground">Click or drop multiple images at once</p>
                    </>
                  )}
                </div>
              </div>
              <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => e.target.files?.length && onGalleryFiles(e.target.files)} />
            </div>

            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={mainUploading || galleryUploading} className="bg-primary hover:bg-primary/90">
                {editing ? "Save changes" : "Create product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ProductsAdmin;
