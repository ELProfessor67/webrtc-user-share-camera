import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog"

export function DialogComponent({open, setOpen, children}) {
  return (
    // <Dialog open={open} onOpenChange={setOpen}>
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        {children}
      </DialogContent>
    </Dialog>
  )
}
