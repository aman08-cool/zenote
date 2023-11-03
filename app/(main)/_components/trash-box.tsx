"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "@/components/spinner";
import { Search, Trash, Undo } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/modals/confirm-modal";
export const TrashBox = () => {
  const router = useRouter();
  const params = useParams();
  const documents = useQuery(api.documents.getTrash);
  const restore = useMutation(api.documents.restore);
  const remove = useMutation(api.documents.remove);

  const [search, setaSearch] = useState("");
  const filteredDocuments = documents?.filter((document) => {
    return document.title.toLowerCase().includes(search.toLowerCase());
  });
  const onClick = (documentId: string) => {
    router.push(`/document/${documentId}`);
  };
  const onRestore = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    documentId: Id<"documents">
  ) => {
    event.stopPropagation();
    const promise = restore({ id: documentId });
    toast.promise(promise, {
      loading: "Restoring Note...",
      success: "Note restored!",
      error: "Error restoring Note",
    });
  };
  const onRemove = (documentId: Id<"documents">) => {
    const promise = remove({ id: documentId });
    toast.promise(promise, {
      loading: "Deleting Note...",
      success: "Note deleted!",
      error: "Error deleting Note",
    });
    if (params.documentId === documentId) {
      router.push("/documents");
    }
  };
  if (documents === undefined) {
    return (
      <div className=" h-full flex items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    );
  }
  return (
    <div className=" text-sm">
      <div className=" flex items-center gap-x-1 p-2">
        <Search className=" h-4 w-4" />
        <Input
          value={search}
          onChange={(e) => setaSearch(e.target.value)}
          className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
          placeholder="Filter by page title"
        />
      </div>
      <div className=" mt-2 px-1 pb-1">
        <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
          No notes found
        </p>
        {filteredDocuments?.map((document) => (
          <div
            key={document._id}
            role="button"
            className=" text-sm rounded-sm w-full flex items-center hover:bg-primary/5 text-primary justify-between cursor-pointer"
            onClick={() => onClick(document._id)}
          >
            <span className=" truncate pl-2 ">{document.title}</span>
            <div className=" flex items-center">
              <div
                role="button"
                className="p-2 rounded-sm hover:bg-neutral-200"
                onClick={(e) => onRestore(e, document._id)}
              >
                <Undo className=" h-4 w-4 text-muted-foreground" />
              </div>
              <ConfirmModal onConfirm={()=>onRemove(document._id)}>
                <div
                  role="button"
                  className="p-2 rounded-sm hover:bg-neutral-200"
                >
                  <Trash className=" h-4 w-4 text-muted-foreground" />
                </div>
              </ConfirmModal>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
