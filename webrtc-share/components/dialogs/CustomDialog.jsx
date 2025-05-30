import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader
} from "@/components/ui/dialog"

const CustomDialog = ({open,setOpen,children,heading}) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[600px] bg-white dialog-content rounded-none border-none">
                <DialogHeader className={'bg-purple-500 text-white absolute top-0 left-0 right-0 h-[3rem] flex items-center justify-center'}>
                    <h2 className='text-lg font-bold'>{heading}</h2>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}

export default CustomDialog