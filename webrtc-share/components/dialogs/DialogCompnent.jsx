import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog"

export function DialogComponent({open, setOpen,isCloseable = false, children}) {
  return (
    // <Dialog open={open} onOpenChange={setOpen}>
    <Dialog open={open} onOpenChange={isCloseable ? setOpen : () => {}}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        {children}
      </DialogContent>
    </Dialog>
  )
}
