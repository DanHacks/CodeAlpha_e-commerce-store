import { useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useProducts } from "@/context/ProductsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Pencil, Plus, Trash2, Search, Tags, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Simulated network latency for optimistic UI demo
const fakeLatency = () => new Promise((r) => setTimeout(r, 450));

const CategoriesAdmin = () => {
  const { categories, createCategory, renameCategory, deleteCategory, countByCategory } = useProducts();

  const [query, setQuery] = useState("");

  // Optimistic overlays — shown alongside real categories until backend "confirms"
  const [pendingAdds, setPendingAdds] = useState<string[]>([]);
  const [pendingRenames, setPendingRenames] = useState<Record<string, string>>({}); // old -> new
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const [editing, setEditing] = useState<string | null>(null);
  const [renameTo, setRenameTo] = useState("");
  const [confirmRenameOpen, setConfirmRenameOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);

  const [deleting, setDeleting] = useState<string | null>(null);
  const [reassignTo, setReassignTo] = useState<string>("__none");
  const [deletingBusy, setDeletingBusy] = useState(false);

  // Display list = real categories + optimistic adds, minus optimistic deletes,
  // with optimistic renames mapped through.
  const displayList = useMemo(() => {
    const merged = Array.from(new Set([...categories, ...pendingAdds]));
    return merged
      .filter((c) => !pendingDeletes.includes(c))
      .map((c) => pendingRenames[c] ?? c)
      .filter((c) => c.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
  }, [categories, pendingAdds, pendingDeletes, pendingRenames, query]);

  const isPending = (c: string) =>
    pendingAdds.includes(c) ||
    Object.values(pendingRenames).includes(c) ||
    pendingDeletes.includes(c);

  // CREATE — optimistic add, rollback on failure
  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return toast.error("Category name required");
    if (
      categories.some((c) => c.toLowerCase() === trimmed.toLowerCase()) ||
      pendingAdds.some((c) => c.toLowerCase() === trimmed.toLowerCase())
    ) {
      return toast.error("Category already exists");
    }

    setCreating(true);
    setPendingAdds((p) => [...p, trimmed]); // optimistic
    setCreateOpen(false);
    setNewName("");
    try {
      await fakeLatency();
      const ok = createCategory(trimmed);
      if (!ok) throw new Error("Create rejected");
    } catch {
      setPendingAdds((p) => p.filter((c) => c !== trimmed)); // rollback
      toast.error("Failed to create category");
    } finally {
      setPendingAdds((p) => p.filter((c) => c !== trimmed)); // clear overlay (real list now has it)
      setCreating(false);
    }
  };

  // RENAME — open confirm, then optimistic
  const openRename = (c: string) => { setEditing(c); setRenameTo(c); };
  const requestRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const trimmed = renameTo.trim();
    if (!trimmed) return toast.error("New name required");
    if (trimmed === editing) { setEditing(null); return; }
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      return toast.error("A category with that name already exists");
    }
    setConfirmRenameOpen(true);
  };
  const confirmRename = async () => {
    if (!editing) return;
    const from = editing;
    const to = renameTo.trim();
    setRenaming(true);
    setPendingRenames((p) => ({ ...p, [from]: to })); // optimistic
    try {
      await fakeLatency();
      const ok = renameCategory(from, to);
      if (!ok) throw new Error("Rename rejected");
    } catch {
      toast.error("Failed to rename category");
    } finally {
      setPendingRenames((p) => { const n = { ...p }; delete n[from]; return n; });
      setRenaming(false);
      setConfirmRenameOpen(false);
      setEditing(null);
    }
  };

  // DELETE — confirm dialog already exists; add busy + optimistic
  const confirmDelete = async () => {
    if (!deleting) return;
    const target = deleting;
    setDeletingBusy(true);
    setPendingDeletes((p) => [...p, target]); // optimistic hide
    try {
      await fakeLatency();
      deleteCategory(target, { reassignTo: reassignTo === "__none" ? undefined : reassignTo });
    } catch {
      setPendingDeletes((p) => p.filter((c) => c !== target)); // rollback
      toast.error("Failed to delete category");
    } finally {
      setPendingDeletes((p) => p.filter((c) => c !== target));
      setDeletingBusy(false);
      setDeleting(null);
      setReassignTo("__none");
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-primary font-semibold uppercase tracking-wider">Catalog</p>
          <h1 className="text-3xl font-bold text-secondary">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Renaming a category updates every product using it.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="h-4 w-4" /> New category
        </Button>
      </div>

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search categories..." className="pl-9" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="p-3 font-semibold">Category</th>
              <th className="p-3 font-semibold">Products</th>
              <th className="p-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayList.map((c) => {
              const pending = isPending(c);
              const count = countByCategory(c);
              return (
                <tr key={c} className={`border-t border-border hover:bg-muted/30 ${pending ? "opacity-60" : ""}`}>
                  <td className="p-3">
                    <div className="flex items-center gap-2 font-medium">
                      <Tags className="h-4 w-4 text-primary" /> {c}
                      {pending && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" /> syncing
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{count}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" disabled={pending} onClick={() => openRename(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={pending}
                        className="text-destructive"
                        onClick={() => { setDeleting(c); setReassignTo("__none"); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {displayList.length === 0 && (
              <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">
                {categories.length === 0 ? "No categories yet — create your first one." : "No matches."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={(o) => !creating && setCreateOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
            <DialogDescription>This will be available immediately for product assignment.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCreate} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Wearables" required autoFocus disabled={creating} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
              <Button type="submit" disabled={creating} className="bg-primary hover:bg-primary/90 gap-2">
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                {creating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename — input dialog */}
      <Dialog open={!!editing && !confirmRenameOpen} onOpenChange={(o) => !renaming && !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename "{editing}"</DialogTitle></DialogHeader>
          <form onSubmit={requestRename} className="space-y-4">
            <div>
              <Label>New name</Label>
              <Input value={renameTo} onChange={(e) => setRenameTo(e.target.value)} required autoFocus />
              <p className="text-xs text-muted-foreground mt-1">
                {editing && countByCategory(editing) > 0
                  ? `${countByCategory(editing)} product(s) will be updated.`
                  : "No products will be affected."}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">Continue</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename — confirmation */}
      <AlertDialog open={confirmRenameOpen} onOpenChange={(o) => !renaming && setConfirmRenameOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename "{editing}" to "{renameTo}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {editing && countByCategory(editing) > 0
                ? `This will update ${countByCategory(editing)} product(s). This cannot be undone automatically.`
                : "No products are currently assigned to this category."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={renaming}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmRename(); }}
              disabled={renaming}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              {renaming && <Loader2 className="h-4 w-4 animate-spin" />}
              {renaming ? "Renaming..." : "Confirm rename"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !deletingBusy && !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleting}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && countByCategory(deleting) > 0
                ? `${countByCategory(deleting)} product(s) currently use this category. Choose where to move them.`
                : "This category isn't used by any product."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleting && countByCategory(deleting) > 0 && (
            <div className="space-y-2">
              <Label>Reassign products to</Label>
              <Select value={reassignTo} onValueChange={setReassignTo} disabled={deletingBusy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Leave uncategorised</SelectItem>
                  {categories.filter((c) => c !== deleting).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmDelete(); }}
              disabled={deletingBusy}
              className="bg-destructive hover:bg-destructive/90 gap-2"
            >
              {deletingBusy && <Loader2 className="h-4 w-4 animate-spin" />}
              {deletingBusy ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default CategoriesAdmin;
