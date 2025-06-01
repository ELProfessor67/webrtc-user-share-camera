import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader
} from "@/components/ui/dialog"

const CustomDialog = ({open,setOpen,children,heading}) => {
    return (
        <Dialog open={open} onOpenChange={setOpen} className="overflow-auto">
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-white dialog-content rounded-xl border-none outline-none shadow-none ring-0 p-0 overflow-hidden">
                <DialogHeader className={'bg-purple-500 text-white absolute top-0 left-0 right-0 h-[3rem] flex items-center justify-center rounded-t-xl border-none m-0'}>
                    <h2 className='text-[1.8rem] font-bold text-white'>{heading}</h2>
                </DialogHeader>
                <div className='max-h-[calc(90vh-3rem)] overflow-auto pt-[3rem] p-6'>
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default CustomDialog